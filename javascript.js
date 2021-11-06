if (sf == undefined) {
	// Simply a .5 second timer after page load. JS onload doesn't seem
	// to work very well here.
	setTimeout(function() {
		var messages = document.getElementsByClassName("comment-text");
		if (messages.length == 0) {
			sf.init();
		} else {
			for (var i = 0; i < messages.length; i++) {
				// Clean comment before sending it to parser
				var comment = messages[i].innerText;
				comment = comment.replace(/\</g, "&lt;");
				comment = comment.replace(/\>/g, "&gt;");
	
				messages[i].innerHTML = sf.parse(comment);
			}
		}
	}, 500);
} else {
	console.log("ScratchFormat loaded more than once, quitting")
}

// The initial SF app object
// Create the initial formatter element
var sf = {
	formatter: null
};

// Use a simple DOM element to check Scratch 3/2 UI.
sf.version = 3;
if (document.body.children[0].id == "pagewrapper") {
	sf.version = 2;
}

// Create the SF "tags"
// Everything is customizable here.
// (local images don't work yet, but who cares.
// this is the internet.)
sf.tags = [
	{
		"name": "bold",
		"tag": "b",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/bold.svg",
		"fillers": ["**", "**"],
		"formatter": function(part1, part2) {
			return "<b>" + part2 + "</b>";
		}
	},
	{
		"name": "italics",
		"tag": "i",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/italic.svg",
		"fillers": ["*", "*"],
		"formatter": function(part1, part2) {
			return "<i>" + part2 + "</i>";
		}
	},
	{
		"name": "code",
		"tag": "code",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/code-view.svg",
		"fillers": ["`", "`"],
		"formatter": function(part1, part2) {
			return "<code class='sfcode'>" + part2 + "</code>";
		}
	},
	{
		"name": "underline",
		"tag": "u",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/underline.svg",
		"fillers": ["[u]", "[/u]"],
		"formatter": function(part1, part2) {
			return "<u>" + part2 + "</u>";
		}
	},
	{
		"name": "color",
		"tag": "color",
		"sensitive": true, // Prevent exploits
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Design/paint-brush-line.svg",
		"fillers": ["[color=red]", "[/color]"],
		"formatter": function(part1, part2) {
			return "<span style='color:" + part1 + "'>" + part2 + "</span>";
		}
	},
	{
		"name": "link",
		"tag": "link",
		"dontshow": true,
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/link.svg",
		"fillers": ["[link=URLHERE]", "[/link]"],
		"formatter": function(part1, part2) {
			return "<a href='" + part1 + "'  target='_newtab'>" + part2 + "</a>";
		}
	},
	{
		"name": "easteregg",
		"tag": "easteregg",
		"dontshow": true,
		"fillers": ["[easteregg]"],
		"formatter": function(part1, part2) {
			return "( ͡° ͜ʖ ͡°)";
		}
	},
	{
		"name": "help",
		"help": true,
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/question-mark.svg",
		"ignore": true
	}
];

// First, initialize the formatter, and its icons.
// This is executed on the next block
sf.init = function() {
	var textareaFinder = "[name=compose-comment],[name=content]";

	// Helpful first textarea message
	var findFirst = document.querySelectorAll(textareaFinder);
	if (findFirst.length > 0) {
		findFirst[0].placeholder = "Click here to activate ScratchFormat";
	} else {
		// Kill all if there are no textareas
		return;
	}

	sf.formatter = document.createElement("div");
	sf.formatter.id = "formatter";
	for (var t = 0; t < sf.tags.length; t++) {
		if (sf.tags[t].dontshow) {
			// Skip to next part int this loop
			continue;
		}

		var icon = document.createElement("img");
		icon.src = sf.tags[t].src;
		icon.title = sf.tags[t].name;

		// Simply put a margin before underline because it separates
		// Markdown options and SFCode
		if (sf.tags[t].name == "underline") {
			icon.style.marginLeft = "20px";
		}

		// Help icon
		if (sf.tags[t].help) {
			icon.style.float = "right";
			icon.addEventListener("click", function() {
				// Popup message HTML got a bit out of hand here
				smod.dialogText({
					title: "ScratchFormat Help",
					text: helpMsg
				});
			});

			sf.formatter.appendChild(icon);
			continue;
		}

		// Set up code for each icon
		icon.fillers = sf.tags[t].fillers;
		icon.onclick = function(event) {
			var textarea = event.target.parentElement.parentElement.children[1];
			var fillers = event.target.fillers;

			// Grab the selected text
			var selection = textarea.value.substring(
				textarea.selectionStart,
				textarea.selectionEnd
			);

			if (selection.length == 0) {
				selection = "text";
			}

			// Generate new text, if just 1 filler, ex [br], don't attempt
			// to use second part.
			var newText = textarea.value.substring(0, textarea.selectionStart)
			if (fillers.length > 1) {
				newText += fillers[0] + selection + fillers[1];
			} else {
				newText += fillers[0];
			}

			newText += textarea.value.substring(textarea.selectionEnd);

			textarea.value = newText;
			textarea.focus();
		}

		sf.formatter.appendChild(icon);
	}

	// Move formatter if user clicks on textarea.
	document.body.onclick = function(event) {
		// Note: duplicate of "textareaFinder"
		if (event.target.name == "content" || event.target.name == "compose-comment") {
			// Check if it already has formatter.
			// A somewhat messy solution, but it is fine.
			if (event.target.parentElement.children[0].id !== "formatter") {
				event.target.parentElement.prepend(sf.formatter);
				event.target.style.height = "250px";
				sf.formatter.style.width = event.target.offsetWidth + "px";
				event.target.style.resize = "auto";
			}
		}
	}

	// Initial background formatting loop.
	// This just checks for new comments
	setInterval(function() {
		sf.format();
	}, 300);
}

// Function to format comments that are not already
// formatted
sf.oldComments = 0;
sf.format = function() {
	// Quit if we already formatted those comments.
	// Checks for last vs new length.
	var comments = document.querySelectorAll(".content, .emoji-text");
	if (sf.oldComments == comments.length) {
		return;
	}

	sf.oldComments = comments.length;

	for (var c = 0; c < comments.length; c++) {
		comments[c].style.whiteSpace = "pre-line";
		if (comments[c].className == "emoji-text") {
			comments[c].style.marginLeft = "3px";
		}

		// Go through all the text child nodes and replace them with a span
		// element.
		for (var i = 0; i < comments[c].childNodes.length; i++) {
			if (comments[c].childNodes[i].nodeName == "#text") {
				var p = document.createElement("span");

				var comment = comments[c].childNodes[i].data
				comment = comment.replace(/\</g, "&lt;");
				comment = comment.replace(/\>/g, "&gt;");
				p.innerHTML = " " + sf.parse(comment) + " ";
				comments[c].childNodes[i].replaceWith(p);
			}
		}
	}
}

sf.parseMD = function(text) {
	// Allow asterisks in code block
	text = text.replace(/[`].+[`]/gm, function(x) {return x.replace(/\*/gm, "&ast;")});

	text = text.replace(/```((.|\n*)*?)```/gm, "<code class='sfcode'>$1</code>");
	text = text.replace(/`(.*?)`/g, "<code>$1</code>");
	
	// Bold, then italics
	text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
	text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");

	// Don't format links that already have a tag with them
	// Sorry, I cheated with Stackoverflow :\
	// https://stackoverflow.com/a/8943487
	text = text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1'>$1</a>");
	return text;
}

// Custom regex SFCode* parser. It parses differently than BBcode. Instead
// Of replacing [b] with <b>, it it replaces both tags with
// text between them. Therefore, "[b][b]Hello[/b][/b]" will not work.
// It doesn't really matter though, and won't be changed unless it
// is able to cause significant issues in the future.
// *ScratchFormat Markup Language (basically BBCode)
sf.parse = function(text) {
	// Note that the new scratchformat standard is [],
	// and the () is outdated, and a bit harder to type.
	// But, we will detect both for historical reasons
	let startBracket = "[\\(|\\[]";
	let endBracket = "[\\)|\\]]";

	for (var t = 0; t < sf.tags.length; t++) {
		if (sf.tags[t].ignore) {
			continue;
		}

		// First part of tag
		var regex = "";
		regex += startBracket;
		regex += sf.tags[t].tag;
		if (sf.tags[t].sensitive) {
			regex += "[=]*([a-zA-Z0-9\#\(\)\,]*)";
		} else {
			regex += "[=]*([^\\]\\[\\)\\(]*)";
		}
		
		regex += endBracket;

		// If just 1 tag (Ex [easteregg])
		if (sf.tags[t].fillers.length > 1) {
			// Lazy matching (?)
			// Since we can't use the s flag in Firefox,
			// This is an alternative that matches it using |
			regex += "((.|\n*)*?)";

			// Second part of tag
			regex += startBracket;
			regex += "\/";
			regex += sf.tags[t].tag;
			regex += endBracket;
		}

		regex = new RegExp(regex, "gm");
		text = text.replace(regex, sf.tags[t].formatter("$1", "$2"));
	}

	// Format trailing breaklines and spaces
	text = text.replace(/^(\n| )+/gm, "");
	text = text.trim("\n"); // Trim last newlines

	text = sf.parseMD(text);

	return text;
}

var controlGroup = document.getElementsByClassName("control-group");
document.controlGroup.innerHTML += '<div class="dropdown">   <button onclick="myFunction()" class="dropbtn">😀</button>   <div id="myDropdown" class="dropdown-content">     <a onclick="pasteEmoji('_:D_')"><img src="https://cdn.scratch.mit.edu/scratchr2/static/__fd54d8440ae146e24183f3a920f85c36__/images/easter_eggs/aww-cat.png" width="25px"></a>     <a onclick="pasteEmoji('_:P_')"><img src="https://cdn.scratch.mit.edu/scratchr2/static/__9e4044de46c7852aec750b6571cceb92__/images/easter_eggs/lol-cat.png" width="25px"></a>     <a onclick="pasteEmoji('_<3_')"><img src="https://cdn.scratch.mit.edu/scratchr2/static/__9e4044de46c7852aec750b6571cceb92__/images/easter_eggs/love-it-cat.png" width="25px"></a>     <br>     <button onclick="myFunction()"  class="dropbtn b">Help</button>   </div> </div> <textarea id="box"></textarea>'
document.controlGroup.style = ".dropbtn {   background-color: #3498DB;   color: white;   padding: 16px;   font-size: 16px;   border: none;   cursor: pointer; }  .dropbtn {  box-shadow:inset 0px 1px 0px 0px #54a3f7;  background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);  background-color:#007dc1;  border-radius:5px;  border:1px solid #124d77;  display:inline-block;  cursor:pointer;  color:#ffffff;  font-family:Arial;  font-size:17px;  padding:10px 10px;  text-decoration:none;  text-shadow:1px 1px 0px #154682; } .dropbtn:hover .dropbtn:hover {  background:linear-gradient(to bottom, #0061a7 5%, #007dc1 100%);  background-color:#0061a7; } .dropbtn:active {  position:relative;  top:1px; } .dropbtn.b{ padding:7px 10px; width:100%;}            .dropdown {   position: relative;   display: inline-block; }  .dropdown-content {   display: none;   position: absolute;   background-color: white;   min-width: 160px;   overflow: auto;   box-shadow: 0px 1px 8px 0px rgba(0,0,0,0.2);   z-index: 1;   border-radius:5px;   border:#d1d1d1 solid 1px;   padding:5px; }  .dropdown-content a {   cursor:pointer;   color: black;   padding: 0px;   width:30px;   height:27px;   padding-top:3px;   text-align:center;   text-decoration: none;   display: inline-block;    }  .dropdown a:hover {background-color: #ebebeb;}  .show {display: block;}"

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function pasteEmoji(emoji){
document.getElementById('box').value += emoji;
}
