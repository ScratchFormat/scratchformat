// Loads javascript onto page
var scripts = ["smod.js", "javascript.js"];

for (var s = 0; s < scripts.length; s++) {
	var script = document.createElement("script");
	script.src = chrome.extension.getURL(scripts[s]);

	document.head.appendChild(script);
}
