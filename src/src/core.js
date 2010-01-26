//////
/////
////         Expression Widgets - JetPack for Learning 2010
///
//

/* JEP Profile Disclaimer 
   ---
*/

// https://wiki.mozilla.org/Labs/Jetpack/JEP/12
jetpack.future.import("selection");   
// https://wiki.mozilla.org/Labs/Jetpack/JEP/16
jetpack.future.import("slideBar"); 
jetpack.future.import("me"); 
// https://developer.mozilla.org/en/Jetpack/Storage/Simple_storage
jetpack.future.import("storage.simple");

/* App Core 
   --- 
   The xWid is the application code. We have here the basic user experience so 
   the user/participant can feel they can use this app to engage in a give 
   collaboration session, associate their user with the remote repository, 
   and also means to deal with the widgets. We now keep the widget codes 
   separated from this. So, from a certain angle, the Expression Widgets, 
   is like JetPack. It aims to create a model that Widgets can work together
   and load/post/sync with the repository ( contribution from others ). 
*/

var xWid = { 

  canvas    : null, 
  canvasTab : null, 
 
  localStore: jetpack.storage.simple,  // This is the interface to the local 
					   // and persistant storage service. 
  resources : null, // check for xWid.resources section in this file... 
  uiDoc     : null, 
  transport : null,       // This is a plugin. See the build system. 
  digester  : null,       // This is a plugin. See the build system. 
    
  cssStack_slidebar: new Array(), 
 
  launchForGrab : function (currWin,x,y,w,h){
     this.canvas = this.uiDoc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
     jQuery(this.canvas).appendTo(jQuery("body",this.uiDoc));
     xWid.createPreviewFromArea( currWin ,x,y,w,h, this.canvas);

  }, 
  createPreviewFromArea : function(cw, x,y,w,h, canvas){
    canvas.width=w;
    canvas.height=h;
    canvas.getContext("2d").drawWindow(cw, x, y, w,h, "white");
    return canvas;
  }, 
  dump: function (str) { 
	jQuery("#debug",this.uiDoc).append(str);

  } ,
  settingsChanged: function () { 
 	this.localStore.login       = jQuery("#login",     xWid.uiDoc).val();
 	this.localStore.repository  = jQuery("#repository",xWid.uiDoc).val();
	jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
        jQuery("#notificationpanel",xWid.uiDoc).html("Just saved your screenname URL settings. <button id='godone'>Done</button>");

	xWid.transport.repository = xWid.localStore.repository;
	xWid.transport.login      = xWid.localStore.login;

        jQuery("#godone",xWid.uiDoc).click( function () {
              jQuery("#notificationpanel",xWid.uiDoc).html("");
              jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
        });
  },

  loadingOn: function () { 
	jQuery("#loadingfeedback",this.uiDoc).css("display","block");
  }, 
  loadingOff: function () { 
	jQuery("#loadingfeedback",this.uiDoc).css("display","none");
  },
  ////
  /// man init point
  //
  init: function () { 
	this.uiDoc = jetpack.slideBar.append({
		url: "about:blank",
		width: 300,
 		persist: true, 
		onClick: function(slide) {
			slide.icon.src = "chrome://branding/content/icon48.png";
		},   
                onReady: function(slide) { 

			xWid.uiDoc = slide.contentDocument; 

			// This is a little framework to let others to add new style to the slidebar..
			var cssBuffer = "";
			for (var key in xWid.cssStack_slidebar) { 
				cssBuffer += xWid.cssStack_slidebar[key];				
				xWid.dump("Adding.. " + cssBuffer );
 			} 

			jQuery(slide.contentDocument.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",slide.contentDocument)).append( xWid.resources.style_slidebar_head + cssBuffer );

			// end..

			jQuery("body", slide.contentDocument).html(xWid.resources.html_panel);

			xWid.transport.login      = xWid.localStore.login; 
			xWid.transport.repository = xWid.localStore.repository; 

 			jQuery("#login", slide.contentDocument).val(xWid.transport.login); 
 			jQuery("#repository", slide.contentDocument).val(xWid.transport.repository); 
			jQuery("#login", slide.contentDocument).change( function () { 
				xWid.settingsChanged();
			});
			jQuery("#repository", slide.contentDocument).change( function () { 
				xWid.settingsChanged();
			});

			jQuery("#goinit",slide.contentDocument).click( function () { 
				xWid.transport.init();
			});
			jQuery("#goclass",slide.contentDocument).click( function () { 
				var visitRepo = jetpack.tabs.open(xWid.transport.repository);
				visitRepo.focus();
			});
			jQuery("#gosave",slide.contentDocument).click( function () { 
				xWid.digester.refreshSelfTextArea();
				xWid.dump(xWid.digester.userContent);
				xWid.transport.sync(xWid.digester.userContent);

			});

			// Notice we populate the widgets here in the menu but we dont yet 
			// enable the #widgetspanel UI element .. only if they are logged in 
			// soon later on depends on state / wiki flow...

			for (key in widgets.list) { 
				let currWidget = widgets.list[key];
				let objRegister = currWidget.register(slide.contentDocument);
				jQuery("#widgetspanel",slide.contentDocument).append(objRegister.markup_menu);
				jQuery("#"+objRegister.init_bind_id, slide.contentDocument).click (function () { 
					currWidget.init();
				}) 
			} 

			// use this to speed up widgets panels in the UI aside from the login state
			// jQuery("#widgetspanel", xWid.uiDoc).css("display","block");

                }
	});
  } 

}  // End of general widget code 

xWid.init();

/* Local Resources 
   ---
   Under this section you can keep simply the assets related to HTML and aCSS. These
   elements can get inserted in Documents/UI that is part of this basic JetPack UX. 
*/

xWid.resources = { 
    html_panel     : "<table><tr><td>User</td><td><input id='login' type='text' /></td></tr><tr><td><button id='goclass'>Class:</button></td><td><input id='repository' type='text' /></td></tr><tr><td align='center' colspan='2'><button id='goinit'>Login</button><button id='gosave' disabled='disabled'>Save wiki</button></td></tr></table><div id='loadingfeedback'><img src='chrome://global/skin/media/throbber.png'></div><div id='notificationpanel'></div> <div id='widgetspanel'></div><div id='widgetscanvas'></div> <div id='historycontainer'><div id='historypanel'></div></div> <div id='debug'></div>", 
    html_login_helper: "<div id='helper'>You are not logged in. Log over the wiki and then click here <button id='gotry'>Retry</button> </div>",
    style_slidebar_head: " #loadingfeedback { padding:1em; display:none;text-align:center } table { margin:auto;  margin-top:1em; margin-bottom:0; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:92%; border:3px solid black; background-image: -moz-linear-gradient(top, lightblue, #fff); } table td { padding:.2em }  input { -moz-border-radius:8px; } #widgetspanel { display:none; margin:auto; margin-top:0; width:80%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius: 0 0 10px 10px; background-image: -moz-linear-gradient(top, #000, #000);  } #widgetscanvas { display:none; margin:auto; margin-top:.5em; width:90%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%;  }  #notificationpanel { margin:auto; width:90%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, lightyellow, #fff); display:none  } #historycontainer {  margin:auto; width:90%; padding:.2em; margin-top:.5em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px;  background-image: -moz-linear-gradient(top, #ddd, #fff); display:none; overflow:hidden } #historypanel { width:400px } #widgetspanel button { -moz-border-radius:8px; border:1px solid black; padding:3px; margin:2px } .statement { border-bottom:1px solid gray; display:block; font-size:86%; font-family:arial; margin-bottom:.5em; }  ",
} 


/* 
   Widgets 
   ---
   Check the last line in this code if you want to register your widget
*/

var widgets = { 
	list: new Array()
} 

