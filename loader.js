var div = document.createElement('div')
div.className = 'scratchformat banner'
div.style.backgroundColor = '#FF661A'
div.innerHTML = `
        <div class="container">
          <span style="width: 90vw;">ScratchFormat is no longer being maintained. It is now part of a larger extension for Scratch called <a href="https://tools.scratchstatus.org/">ScratchTools</a>, please install to continue with ScratchFormat.</span>
        </div>
`
document.querySelector('div#pagewrapper').insertBefore(div, document.querySelector('div.email-outage.banner'))
