{var s = document.createElement('script');
s.src = chrome.extension.getURL('smod.js');
(document.head||document.documentElement).appendChild(s);}

{var s = document.createElement('script');
s.src = chrome.extension.getURL('javascript.js');
(document.head||document.documentElement).appendChild(s);}
