// Create the initial formatter element
var formatter;

// Everything is customizable here.
// (local images don't work yet, but who cares.
// this is the internet.)
var tags = [
	{
		"name": "bold",
		"tag": "b",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/bold.svg",
		"fillers": ["[b]", "[/b]"],
		"formatter": function(part1, part2) {
			return "<b>" + part2 + "</b>";
		}
	},
	{
		"name": "italics",
		"tag": "i",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/italic.svg",
		"fillers": ["[i]", "[/i]"],
		"formatter": function(part1, part2) {
			return "<i>" + part2 + "</i>";
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
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/font-color.svg",
		"fillers": ["[color=red]", "[/color]"],
		"formatter": function(part1, part2) {
			return "<span style='color:" + part1 + "'>" + part2 + "</span>";
		}
	},
	{
		"name": "link",
		"tag": "link",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/link.svg",
		"fillers": ["[link=", "]Link[/link]"],
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
			return "<i>Yes? No. Or is it?</i>";
		}
	}
]

// Firstly, initialize the formatter, and its icons
// This is a 1 second timeout for page load, since I am
// too lazy to figure out real page load times
setTimeout(function() {
	var textareaFinder = "[name=compose-comment],[name=content]";

	document.querySelectorAll(textareaFinder)[0].placeholder = "Click here to activate ScratchFormat";

	formatter = document.createElement("div");
	formatter.id = "formatter";
	for (var t = 0; t < tags.length; t++) {
		if (tags[t].dontshow) {
			continue;
		}

		var icon = document.createElement("img");
		icon.src = tags[t].src;
		icon.fillers = tags[t].fillers;

		// This may look janky, but with Chrome extensions,
		// Everything is jank. Basically I have to set custom
		// properties to the element in order to get data without
		// having functions, which would require some "injection"
		// garbage.
		icon.onclick = function(event) {
			var textarea = event.target.parentElement.parentElement.children[1];
			var fillers = event.target.fillers;

			// Grab the selected text
			var selection = textarea.value.substring(
				textarea.selectionStart,
				textarea.selectionEnd
			);

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

		formatter.appendChild(icon);
	}

	// Move formatter if user clicks on textarea.
	document.body.onclick = function(event) {
		if (event.target.name == "content" || event.target.name == "compose-comment") {
			event.target.parentElement.prepend(formatter);
			formatter.style.width = event.target.style.width;
		}
	}

	// Initial background formatting loop.
	setInterval(function() {
		format();
	}, 300);
}, 1000);

var oldComments = 0;
function format() {
	// Quit if we already formatted those comments.
	// Checks for last vs new length.
	var comments = document.querySelectorAll(".content, .emoji-text");
	if (oldComments == comments.length) {
		return;
	}

	oldComments = comments.length

	for (var c = 0; c < comments.length; c++) {
		comments[c].style.whiteSpace = "pre";
		comments[c].style.marginLeft = "5px";
		comments[c].innerHTML = parse(comments[c].innerHTML);
	}
}

// Custom regex parser. Easy to maintain.
function parse(text) {
	// Note that the new scratchformat standard is [],
	// and the () is outdated, and a bit harder to type.
	// But, we will detect both for historical reasons
	var startBracket = "[\\(|\\[]";
	var endBracket = "[\\)|\\]]";

	for (var t = 0; t < tags.length; t++) {

		// First part of tag
		var regex = "";
		regex += startBracket;
		regex += tags[t].tag;
		regex += "(=(.*))*";
		regex += endBracket;

		// If just 1 tag (Ex [br])
		if (tags[t].fillers.length > 1) {
			// Regex statement to parse anything but (), []
			regex += "([^\\)\\]\\[\\(]*)";

			// Second part of tag
			regex += startBracket;
			regex += "\/";
			regex += tags[t].tag;
			regex += endBracket;
		}

		console.log(regex);
		regex = new RegExp(regex, "gm");
		text = text.replace(regex, tags[t].formatter("$2", "$3"));
	}

	text = text.replace(/^(\n| )+/gm, "");

	return text;
}
