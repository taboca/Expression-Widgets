sec = require("securable-module");
ob  = require("observer-service");

exports.main = function(options, callbacks) {
  console.log("Hello World!");

  ob.add("xpcom-startup", function () { console.log('xpcom!!!!') });

  ob.add("app-startup",function (s,d) {  
	console.log("app start");
  } );
  callbacks.quit("OK");
}




