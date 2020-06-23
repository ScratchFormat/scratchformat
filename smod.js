// Copyleft Daniel C 2020
// GNU General Public License v2.0

var smod = {
	dialog2: function(title, element) {
		openDialogue(element, {
			title: gettext(title),

			open: function(e, t) {
				// Keeping for future reference
			},

			close: function(e, t) {
				$(this).dialog("destroy");
				$(".ui-widget-overlay.ui-front").remove();
			},

			show: {
				effect: "clip",
				duration: 250
			},

			hide: {
				effect: "clip",
				duration: 250
			}
		});
	},

	// This is bad, bad, bad. If anybody can find the native
	// way to create popups in Scratch 3.0 React.js, let me know.
	dialog3: function(title, text) {
		var html = `"<div class="ReactModalPortal"><div class="modal-overlay modal-overlay"><div aria-label="Report Comment" class="modal-content mod-report modal-sizes modal-content mod-report" role="dialog" tabindex="-1"><div class="modal-content-close" onclick="this.parentElement.parentElement.parentElement.outerHTML = null;"><img alt="close-icon" class="modal-content-close-img" draggable="true" src="/svgs/modal/close-x.svg"></div><div><div class="report-modal-header" style="background-color: #395c79; box-shadow: inset 0 -1px 0 0 #001fff;"><div class="report-content-label"><span>` + title + `</span></div></div><div class="report-modal-content" style="padding-bottom: 50px;"><div><div class="instructions"><span>` + text +`</span></div></div></div></div></div></div>"</div>`;
		document.body.innerHTML += html;
	},

	dialogText: function(title, text, version) {
		// A good way to check 2.0 vs 3.0 is
		// window["openDialogue"] == undefined
		if (version == 3) {
			this.dialog3(title, text);
		} else {
			var popupContent = document.createElement("div");
			popupContent.innerHTML = text;
			this.dialog2(title, popupContent);
		}
	}
}
