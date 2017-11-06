var observe;
var utextResizeHandler = null;
var dtextResizeHandler = null;
if (window.attachEvent) {
    observe = function (element, event, handler) {
        element.attachEvent('on' + event, handler);
    };
}
else {
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };
}
function init () {
    var utext = document.getElementById('upload-text');
    var dtext = document.getElementById('download-text');
    function createResizeHandler(element) {
        return function resize () {
            // console.log(element.id);
            // console.log(element.scrollHeight);
            if (element.scrollHeight >= 120) {
                element.style.height = 'auto';
                element.style.height = '120px';
                return
            }
            element.style.height = 'auto';
            element.style.height = element.scrollHeight + 'px';
        }
    }
    /* 0-timeout to get the already changed text */
    utextResizeHandler = createResizeHandler(utext)
    dtextResizeHandler = createResizeHandler(dtext)
    // console.log('handlers created');
    function udelayedResize () {
        window.setTimeout(utextResizeHandler, 0);
    }
    function ddelayedResize () {
        window.setTimeout(dtextResizeHandler, 0);
    }
    observe(utext, 'change',  utextResizeHandler);
    observe(utext, 'cut',     udelayedResize);
    observe(utext, 'paste',   udelayedResize);
    observe(utext, 'drop',    udelayedResize);
    observe(utext, 'keydown', udelayedResize);

    observe(dtext, 'change',  dtextResizeHandler);
    observe(dtext, 'cut',     ddelayedResize);
    observe(dtext, 'paste',   ddelayedResize);
    observe(dtext, 'drop',    ddelayedResize);
    observe(dtext, 'keydown', ddelayedResize);

    utext.focus();
    utext.select();
    utextResizeHandler();

    // ddelayedResize();
}