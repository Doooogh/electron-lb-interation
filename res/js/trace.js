(function () {
  var method;
  var noop = function () { };
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
        console[method] = noop;
    }
  }

  if (Function.prototype.bind) {
    window.trace = Function.prototype.bind.call(console.log, console);
  }
  else {
    window.trace = function() {
      Function.prototype.apply.call(console.log, console, arguments);
    };
  }
})();
//function trace(){
//    var html = jQuery("#_info").html() + "<br/>";
//    for(var i=0; i<arguments.length; i++) {
//        html += "<br/>" + arguments[i];
//    }
//    jQuery("#_info").html(html);
//}
performance.now = performance.now || performance.webkitNow;

function _now() {
  if(typeof performance === "undefined")
    return "";
  else
    return (performance.now() / 1000).toFixed(3);
}