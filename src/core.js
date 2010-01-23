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
   and also means to deal with the widgets. 
*/
var xWid = { 

  canvas    : null, 
  canvasTab : null, 
 
  localStore: jetpack.storage.simple,  // This is the interface to the local 
					   // and persistant storage service. 
  resources : null, // check for xWid.resources section in this file... 
  uiDoc     : null, 
  transport : null, 
 
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

 	this.localStore.login    = jQuery("#login",     xWid.uiDoc).val();
 	this.localStore.repository  = jQuery("#repository",xWid.uiDoc).val();
	jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
        jQuery("#notificationpanel",xWid.uiDoc).html("Just saved your screenname URL settings. <button id='godone'>Done</button>");

	xWid.transport.repository = xWid.localStore.repository;
	xWid.transport.login   = xWid.localStore.login;

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
		width: 250,
 		persist: true, 
		onClick: function(slide) {
			slide.icon.src = "chrome://branding/content/icon48.png";
		},   
                onReady: function(slide) { 
			////	
			/// We set the transport 
			//
			//xWid.transport = libCataliser_Wikimedia; 
			xWid.transport = libCataliser_post; 


			xWid.uiDoc= slide.contentDocument; 

			jQuery(slide.contentDocument.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",slide.contentDocument)).append( xWid.resources.style_slidebar_head );

			jQuery("body", slide.contentDocument).html(xWid.resources.html_panel);

			xWid.transport.repository = xWid.localStore.repository; 
			xWid.transport.login   = xWid.localStore.login; 

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
			jQuery("#gofetch",slide.contentDocument).click( function () { 
				xWid.digester.init(xWid.uiDoc);
				var content = xWid.transport.load();

			});
			jQuery("#gosave",slide.contentDocument).click( function () { 
				xWid.digester.refreshSelfTextArea();
				xWid.transport.sync(xWid.digester.userContent);

			});

 			jQuery("body",slide.contentDocument).append("<div id='debug'></div>");

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
			jQuery("#widgetspanel", xWid.uiDoc).css("display","block");
                }
	});
  } 

}  // End of general widget code 

xWid.init();


/*
jetpack.selection.onSelection(function regionCapture() {

    jetpack.selection.html = "<span style='border:2px solid black;' id='selsel'>" + jetpack.selection.html + "</span>";
    var currDoc = jetpack.tabs.focused.contentDocument;
    var currWin = jetpack.tabs.focused.contentWindow;
    var embedBox = currDoc.getElementById("selsel").getBoundingClientRect(); 
    x = embedBox.left;
    y = embedBox.top;
    w = parseInt(embedBox.width);
    h = parseInt(embedBox.height);

    ////
    /// This is a selection capture that allows for canvas window capture 
    /// for the selection range of a page. 
    //
    //setTimeout("xWid.launchForGrab("+currWin+","+x+","+y+","+w+","+h+")", 2000 );
     var canvas = xWid.uiDoc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
     jQuery(canvas).appendTo(jQuery("body",xWid.uiDoc));
     xWid.createPreviewFromArea( currWin ,x,y,w,h, canvas);
    //xWid.init();

});

*/ 

xWid.digester = { 
	
	slideDoc        : null, 
        userContent     : null,  /* content from the wiki */
        cycle 		: null,  // state machine r/w modes etc

        
	time_getMonth: function ( ) {
		var d = new Date(); 
		return d.getMonth();
	}, 
	time_getYear: function ( ) {
		var d = new Date(); 
		return d.getFullYear();
	}, 
	time_getDay: function ( ) {
		var d = new Date(); 
		return d.getDay();
	}, 
	time_getHour: function ( ) {
		var d = new Date(); 
		return d.getHours();
	}, 
	time_getMin: function ( ) {
		var d = new Date(); 
		return d.getMinutes();
	}, 
	time_getSec: function ( ) {
		var d = new Date(); 
		return d.getSeconds();
	}, 
	init: function (refDocument) { 
		
		this.slideDoc = refDocument;
		jQuery("#historypanel",this.slideDoc).append("<div id='wikisection'><textarea style='width:100%' id='wikitextarea'></textarea></div><div id='history'></div>");
		
	}, 
 	load: function () { 
		jQuery("#wikitextarea",this.slideDoc).val(this.userContent);
	}, 
	refreshSelfTextArea: function () { 
		this.userContent = jQuery("#wikitextarea",this.slideDoc).val();
	} , 

  	parse: function () { 

	} , 

	add: function ( refWidget, data) { 

		var yy = this.time_getYear(); 
		var mm = this.time_getMonth(); 
		var dd = this.time_getDay(); 
		var hh = this.time_getHour(); 
		var mm = this.time_getMin(); 
		var ss = this.time_getSec(); 
	
		this.userContent = this.userContent + "\n * "+refWidget.name+":"+data + "\n" ;
		jQuery("#wikitextarea", this.slideDoc).val( this.userContent );
	} 
} 


var libCataliser_post = { 

        repository  : null,
        status      : null,
        login    : null,

        wikiDoc     : null,
        wikiTab     : null, 
        bufferFrame : null, 
        bufferFrameLoadCallback : function () { } , 
        wikiEditDoc : null,

 	helper_login: function () { 
   		this.wikiTab = jetpack.tabs.open(this.repository);
                this.wikiTab.focus();   // TODO remove the focus to the tab soon
    	}, 


        init: function () {
		 
		var stampedThis = this; 
		if(!this.bufferFrame) { 
 			jQuery("body",xWid.uiDoc).append('<iframe id="frame" class="frame" src="about:blank"></frame>');	
		 	this.bufferFrame = xWid.uiDoc.getElementById("frame");
			jQuery(".frame", xWid.uiDoc).load( function () { stampedThis.bufferFrameLoadCallback() } );
 		} 
		this.bufferFrameLoadCallback =  function(){
				stampedThis.wikiDoc = xWid.uiDoc.getElementById('frame').contentDocument;
				stampedThis.load();	

				stampedThis.isloading=false;
				xWid.loadingOff();
		};

      		jQuery(".frame", xWid.uiDoc).attr("src", this.repository);
		this.isloading=true;
		xWid.loadingOn(); // animation
        },

        load: function () {

		var doc = this.wikiDoc; 
		var foundLogin = false; 
		var stampedThis = this; 
                jQuery("a[title^='Edit section: "+this.login+"']", doc).each( function () {
                        item = jQuery(this).attr("href");
	
			// warning replace this to the base for the wiki site

                        var toURL = "https://wiki.mozilla.org"+item;
			foundLogin = true; 

		 	stampedThis.isloading=true;	
			xWid.loadingOn();

			stampedThis.bufferFrameLoadCallback = function () { 
				stampedThis.isloading=false;
				xWid.loadingOff();
				
				// warning - just moved here to load the text
				// content area just one time. 

				xWid.digester.init(xWid.uiDoc);
                                let doc = xWid.uiDoc.getElementById('frame').contentDocument;
				xWid.digester.userContent = jQuery("#wpTextbox1",doc).val();
                                xWid.transport.wikiEditDoc = doc;
                                xWid.digester.load();
			} 
			jQuery(".frame", xWid.uiDoc).attr("src", toURL);

                })

		if(!foundLogin) { 
			jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
			jQuery("#notificationpanel",xWid.uiDoc).append(xWid.resources.html_login_helper);
			this.helper_login();
			jQuery("#gotry",xWid.uiDoc).click( function () { 
				jQuery("#notificationpanel",xWid.uiDoc).html("");
				jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
				xWid.transport.init();
			});
		} else { 
			jQuery("#goinit", xWid.uiDoc).html("Expressing");
			jQuery("#goinit", xWid.uiDoc).attr("disabled","disabled");
			jQuery("#gosave", xWid.uiDoc).removeAttr("disabled");
			jQuery("#historypanel", xWid.uiDoc).css("display","block");
			jQuery("#widgetspanel", xWid.uiDoc).css("display","block");
		} 

        },
        grab: function () {

        },
        sync: function (dataContentString) {
                jQuery("#wpTextbox1", this.wikiEditDoc).val(dataContentString);
                jQuery("#wpSave",this.wikiEditDoc).trigger("click");
        }

} 

var libCataliser_Wikimedia = { 

	repository  : null, 
	status      : null,
        login    : null, 

	wikiTab     : null, 
	wikiEditDoc : null, 

  	init: function () { 
		this.wikiTab = jetpack.tabs.open(this.repository); 
		this.wikiTab.focus(); 	// TODO remove the focus to the tab soon
 	}, 

	load: function () { 
		var doc = this.wikiTab.contentDocument; 
		jQuery("a[title^='Edit section: "+this.login+"']", doc).each( function () {
                        item = jQuery(this).attr("href");
                        var toURL = "https://wiki.mozilla.org"+item;
                        var editTab = jetpack.tabs.open(toURL);


                        editTab.focus();
			editTab.onReady(function(doc){
				xWid.digester.userContent = jQuery("#wpTextbox1",doc).val();
				xWid.transport.wikiEditDoc = doc;
				xWid.digester.load();	
			}); 

                })
	}, 
	grab: function () { 

  	}, 
	sync: function (dataContentString) { 
		jQuery("#wpTextbox1", this.wikiEditDoc).val(dataContentString);
		jQuery("#wpSave",this.wikiEditDoc).trigger("click");
	} 
} 

/* firstRun */

var manifest = {  
  firstRunPage: <>  
    <p>  
	Welcome to Expression Widgets. 
    </p>  
  </>  
}; 

jetpack.me.onFirstRun(function () {
	jetpack.notifications.show("Oh boy, I'm installed! you are running as alpha test so I did set the repository as being mozilla wiki page and also the login");
	if(xWid.localStore.repository) { 
		// In case we have no previous settings.. 
 	} else { 
 		xWid.localStore.repository = "https://wiki.mozilla.org/Education/Projects/JetpackForLearning/Profiles/expressionWidjets/class1"; 
		xWid.localStore.login = "Marcio";
	} 
});


/* Local Resources 
   ---
   Under this section you can keep simply the assets related to HTML and aCSS. These
   elements can get inserted in Documents/UI that is part of this basic JetPack UX. 
*/

xWid.resources = { 
    html_panel     : "<table><tr><td>User</td><td><input id='login' type='text' /></td></tr><tr><td>Class</td><td><input id='repository' type='text' /></td></tr><tr><td align='center' colspan='2'><button id='goinit'>Login</button><button id='gosave' disabled='disabled'>Save wiki</button></td></tr></table><div id='loadingfeedback'><img src='chrome://global/skin/media/throbber.png'></div><div id='notificationpanel'></div> <div id='widgetspanel'></div><div id='widgetscanvas'></div> <div id='historypanel'></div>", 
    html_login_helper: "<div id='helper'>You are not logged in. Log over the wiki and then click here <button id='gotry'>Retry</button> </div>",
    style_slidebar_head: " #loadingfeedback { padding:1em; display:none;text-align:center } table { margin:auto;  margin-top:1em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:90%; background-image: -moz-linear-gradient(top, lightblue, #fff); } table td { padding:.2em }  input { -moz-border-radius:8px; } #widgetspanel { display:none; margin:auto; margin-top:.5em; width:90%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, #fdd, #fff);  } #widgetscanvas { display:none; margin:auto; margin-top:.5em; width:90%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, #fdd, #fff); }  #notificationpanel { margin:auto; width:90%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, lightyellow, #fff); display:none  } #historypanel {  margin:auto; width:90%; padding:.2em; margin-top:.5em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, #ddd, #fff); display:none }  ",
} 

/* 
   Widgets 
   ---
   Check the last line in this code if you want to register your widget
*/

var widgets = { 
	list: new Array()
} 

