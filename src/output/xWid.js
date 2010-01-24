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
		width: 250,
 		persist: true, 
		onClick: function(slide) {
			slide.icon.src = "chrome://branding/content/icon48.png";
		},   
                onReady: function(slide) { 

			xWid.uiDoc = slide.contentDocument; 

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
//			jQuery("#widgetspanel", xWid.uiDoc).css("display","block");
                }
	});
  } 

}  // End of general widget code 

xWid.init();

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


/* 
 Digester 
 ---
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
		//jQuery("#historypanel",this.slideDoc).append("<div id='wikisection'><textarea style='width:100%' id='wikitextarea'></textarea></div><div id='history'></div>");
	
		xWid.dump("Digester init...");	
	}, 
 	load: function () { 
	//	jQuery("#wikitextarea",this.slideDoc).val(this.userContent);
	}, 
	refreshSelfTextArea: function () { 
	 //	jQuery("#wikitextarea",this.slideDoc).val(this.userContent);
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
	
		/* We now have to send the time stamp using some form of universal date time 
		pattern that can be sortable as we may want to later on sort all the participants
		data by the time they posted */

		var sortableDateTimeStamp = yy+"-"+mm+"-"+dd+" "+hh+":"+mm+":"+ss+" ";	
		this.userContent = this.userContent + "\n * "+ sortableDateTimeStamp +" "+refWidget.name+":"+data + "\n" ;
		//jQuery("#wikitextarea", this.slideDoc).val( this.userContent );

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

/* Please code your widget here using the format widgets.widgetname.... 
   Notice that each widget has some expected "interface" functions 
   so that the main app can load them. For now the register function returns the markup 
   "the icon of the app" that gets inserted to the slidebar... 
*/ 

widgets.snapshot = { 

  name		: "snapshot",  // name bind that gets exported to the remote respository
  referenceContentWindow  : null, 
  canvasTab     : null,
  canvas        : null, 
  slideDoc      : null, 
  edited        : false, 

  // These for the editor that happens when the New Tab is opened  
  editorDoc     : null, 
  editor:  { axis_x: null, axis_y: null, x:0, y:0, on: false, box:null, ww: 0, hh:0  }, 
   
  resources: {
    style_head     : "html {background:#ddd;} body { text-align:center; margin;auto; }  canvas { border:1px solid black}  ",
    html_container : "<canvas id='workingcanvas'></canvas>"
  },

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 

	var obj =  {   
		markup_menu: "<button id='snapshot_do'>Capture</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "snapshot_do"
  	} 
 	return obj;
  },

  init: function () { 

	widgets.snapshot.referenceContentWindow = jetpack.tabs.focused.contentWindow;

	this.canvasTab    = jetpack.tabs.open("about:blank");
	this.canvasTab.focus();
	this.canvasTab.onReady(function(doc) { 

		var namedRefThis = widgets.snapshot; 

		// We populate the new Opened Tab with a canvas tag so that we can capture the previously opened 
		// default tab screenshot onto this Tab, this canvas... 

		jQuery("head title",doc).text("xWidgets: Snapshot");
		jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append( namedRefThis.resources.style_head );
		namedRefThis.canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");

    		jQuery("body",doc).append( namedRefThis.canvas );
		jQuery("body",namedRefThis.slideDoc).append("Dump:"+ namedRefThis.referenceContentWindow);

		// Take the screenshot! 
		// widgets.snapshot.createPreviewRaw(namedRefThis.referenceContentWindow, namedRefThis.canvas);
		namedRefThis.createPreviewFixed(namedRefThis.referenceContentWindow, namedRefThis.canvas);
	
		// Keep this Tab document at our global scope so that the user can edit the canvas later on 
		namedRefThis.editorDoc = doc; 

		namedRefThis.editorInit();  	// let's initialize the events in the new opened Tab so that 
					// user can drag and select a portion of the screeenshot 
 
        } )
		
  }, 

  createPreviewFixed: function (content, canvas) {
    var w = content.innerWidth  + content.scrollMaxX;
    var h = content.innerHeight + content.scrollMaxY;
    var ctx = canvas.getContext("2d");
    var scaledWidth = 600; 
    var scaledHeight = (h*scaledWidth)/w;
    canvas.style.width  = scaledWidth  +"px";
    canvas.style.height = scaledHeight +"px";
    canvas.width  = scaledWidth;
    canvas.height = scaledHeight;
    ctx.scale(scaledWidth/w,scaledHeight/h);
    ctx.clearRect(0, 0, w,h);
    ctx.save();
    ctx.drawWindow(content, 0, 0, w, h, "rgb(255,255,255)");
    ctx.restore();
    return canvas;
  }, 
   
  //// 
  /// Initiaze an editor 
  // 
  editorInit: function () {
	var namedRefThis = this;  // keep a named reference to this current scope so we can pass to the inline 
 			   // function associated with the event listeners... 
        this.editorDoc.addEventListener("mousemove", function (e) { namedRefThis.editorBoxCross(e) } , false);
        this.editorDoc.addEventListener("mouseup",   function (e) { namedRefThis.editorBoxOff(e) } ,   false);
        this.editorDoc.addEventListener("mousedown", function (e) { namedRefThis.editorBoxOn(e) } ,    false);
        jQuery("body", this.editorDoc).append("<div id='editorboxaxisx' style='border:1px dotted gray;position:absolute;width:1px;'></div>");
        jQuery("body", this.editorDoc).append("<div id='editorboxaxisy' style='border:1px dotted gray;position:absolute;height:1px;;'></div>");
        this.editor.axis_x = jQuery("#editorboxaxisx", this.editorDoc);
        this.editor.axis_y = jQuery("#editorboxaxisy", this.editorDoc);
        this.editor.axis_x.css("left", this.editor.x  +"px");
        this.editor.axis_y.css("top",  this.editor.y  +"px");
  },
  editorBoxOn: function(e) {
        if(!this.editor.on && !this.edited) {
                this.editor.on = true;
                var sl = this.editorDoc.body.scrollLeft;
                var st = this.editorDoc.body.scrollTop;
                var leftCanvas = this.canvas.getBoundingClientRect().left + sl;
                var topCanvas  = this.canvas.getBoundingClientRect().top  + st;
                var xx = (e.clientX+sl);
                var yy = (e.clientY+st);
                this.editor.x = xx;
                this.editor.y = yy;
                if(xx>leftCanvas && yy>topCanvas) {
                        jQuery("body",this.editorDoc).append("<div id='editorbox' style='border:1px solid black;position:absolute;'></div>");
                        this.editor.box = jQuery("#editorbox", this.editorDoc);
                        this.editor.box.css("top", this.editor.y  +"px");
                        this.editor.box.css("left",this.editor.x  +"px");
                }
        }
  },
  editorBoxCross: function(e) {

	if(!this.edited) { 
        if(!this.editor.on) {
                try {

                var st = this.editorDoc.body.scrollTop;
                var sl = this.editorDoc.body.scrollLeft;
                var xx = (e.clientX+sl);
                var yy = (e.clientY+st);

                var leftCanvas = this.canvas.getBoundingClientRect().left + sl;
                var topCanvas  = this.canvas.getBoundingClientRect().top  + st;

                if(xx>leftCanvas && yy>topCanvas) {

                        this.editor.axis_y.css("top",    yy + "px");
                        this.editor.axis_y.css("left",   leftCanvas + "px");
                        this.editor.axis_y.css("width",  this.canvas.width   + "px");
                        this.editor.axis_x.css("left",   xx + "px");
                        this.editor.axis_x.css("top",    topCanvas + "px");
                        this.editor.axis_x.css("height", this.canvas.height  + "px");

                }
                } catch(i) {
                }

        } else {

                var st = this.editorDoc.body.scrollTop;
                var sl = this.editorDoc.body.scrollLeft;
                var hh = (e.clientY+st)-this.editor.y-10;
                var ww = (e.clientX+sl)-this.editor.x-10;
                this.editor.ww = ww;
                this.editor.hh = hh;
                this.editor.box.css("height",  hh +"px");
                this.editor.box.css("width",   ww +"px");
        }
	} 
  },

  editorBoxOff: function(e) {
	
	if(!this.edited) { 

	this.edited=true; 
        this.editor.on = false;

        jQuery("#editorbox",      this.editorDoc).remove();
        jQuery("#editorboxaxisx", this.editorDoc).remove();
        jQuery("#editorboxaxisy", this.editorDoc).remove();

	var namedThis = this; 

        this.editorDoc.removeEventListener("mousedown", function (e) { namedThis.editorBoxOn(e)  } ,     false);
        this.editorDoc.removeEventListener("mouseup",   function (e) { namedThis.editorBoxOff(e) } ,     false);
        this.editorDoc.removeEventListener("mousemove", function (e) { namedThis.editorBoxCross(e)  }  , false);

        jQuery("#menu-focus",this.editorDoc).attr("disabled",false);
        jQuery("#menu-focus",this.editorDoc).html("Drag box");

        var sl = this.editorDoc.body.scrollLeft;
        var st = this.editorDoc.body.scrollTop;

        var leftCanvas = this.canvas.getBoundingClientRect().left + sl;
        var topCanvas  = this.canvas.getBoundingClientRect().top  + st;

        var xx = (e.clientX+sl);
        var yy = (e.clientY+st);
        if(xx>leftCanvas && yy>topCanvas) {
                this.editorSnap();
        }
	} 
  }, 
  editorSnap: function () {
        this.createPreviewRaw(this.referenceContentWindow , this.canvas, this.editor.x, this.editor.y, this.editor.ww, this.editor.hh);
	jQuery("body",this.editorDoc).append("<button id='widget_snapshot_addbutton'>Add</button>");
	jQuery("#widget_snapshot_addbutton",this.editorDoc).click( function () { 
		xWid.digester.add(widgets.snapshot, widgets.snapshot.canvas.toDataURL("image/png",""));
	});

  }, 
  createPreviewRaw: function (content, canvas, x,y,dx,dy) {

    var w = content.innerWidth  + content.scrollMaxX;
    var h = content.innerHeight + content.scrollMaxY;

    var ctx = canvas.getContext("2d");

    var refWidth = 600;
    var scaleView = refWidth/w;
    var canvasStyleH = Math.round(h*scaleView);

    var sl = this.editorDoc.body.scrollLeft;
    var st = this.editorDoc.body.scrollTop;
    var canvasx = canvas.getBoundingClientRect().left + sl; //offsetLeft; 
    var canvasy = canvas.getBoundingClientRect().top  + st; //offsetTop;

    x = x-canvasx;
    y = y-canvasy;

    var ex = parseInt((w*x)/refWidth);
    var ey = parseInt((h*y)/canvasStyleH);
    var edx = parseInt((w*dx)/refWidth);
    var edy = parseInt((h*dy)/canvasStyleH);
    var canvasW = edx;
    var canvasH = edy;

    canvas.style.width  = edx+"px";
    canvas.style.height = edy+"px";

    canvas.width  = canvasW;
    canvas.height = canvasH;

    ctx.scale(1,1);
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.save();
    ctx.drawWindow(content, ex, ey, edx, edy, "rgb(255,255,255)");
    ctx.restore();
    return canvas;

  }
} 
/* Register your Widget code here... */

widgets.list.push(widgets.snapshot); 


widgets.text = { 

  name		: "text",  // name bind that gets exported to the remote respository
  slideDoc      : null, 

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 
	var obj =  {   
		markup_menu: "<button id='text_do'>Text</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "text_do"
  	} 
 	return obj;
  },

  init: function () { 
	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
        jQuery("#widgetscanvas",this.slideDoc).html("<input id='widget_text_field' /><button id='widget_text_send'>Send</button>");
	refThis = this; 
        jQuery("#widget_text_send",this.slideDoc).click( function () {
                xWid.digester.add(refThis, jQuery("#widget_text_field",refThis.slideDoc).val());
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
        })

  } 
} 

widgets.list.push(widgets.text); 
/* Put this file at the end of the build :) process */

// Enable the iframe-based wiki negotiation transport 
xWid.transport = libCataliser_post; 

// Enable this to disable debugging 
//xWid.dump = function () { } 




