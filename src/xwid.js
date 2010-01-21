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

  canvas: null, 
  canvasTab: null, 
 
  localStore: jetpack.storage.simple,  // This is the interface to the local 
					   // and persistant storage service. 

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

  ////
  /// man init point
  //
  init: function () { 
	this.uiDoc = jetpack.slideBar.append({
		url: "about:blank",
		width: 200,
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

			xWid.transport.repository = this.localStore.repository; 
			xWid.transport.userName =   this.localStore.username; 

			xWid.uiDoc= slide.contentDocument; 
			jQuery("body", slide.contentDocument).html(xWid.resources.html_panel);


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

			for (key in widgets.list) { 
				var currWidget = widgets.list[key];
				var objRegister = currWidget.register(slide.contentDocument);
				jQuery("body",slide.contentDocument).append(objRegister.markup_menu);
				jQuery("#"+objRegister.init_bind_id, slide.contentDocument).click (function () { 
					objRegister.click_menu();		
				}) 
				
			} 

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
		jQuery("body",this.slideDoc).append("<div id='wikisection'><textarea id='wikitextarea'></textarea></div><div id='history'></div>");
		
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
        userName    : null,

        wikiDoc     : null,
        bufferFrame : null, 
        wikiEditDoc : null,

        init: function () {

 		jQuery("body",xWid.uiDoc).append('<iframe id="frame" class="frame" height="99" width="100%" border="no" style="border:none;padding:0;margin:0;background-color:#fff;" src="about:blank"></frame>');	
		var stampedThis = this; 
	 		
		jQuery(".frame", xWid.uiDoc).load( function(){
				stampedThis.wikiDoc = xWid.uiDoc.getElementById('frame').contentDocument;
			});

      		jQuery(".frame", xWid.uiDoc).attr("src", this.repository);
        },

        load: function () {


		try { 
		var doc = this.wikiDoc; 
		
                jQuery("a[title^='Edit section: "+this.userName+"']", doc).each( function () {
                        item = jQuery(this).attr("href");
                        var toURL = "https://wiki.mozilla.org"+item;

			jQuery(".frame", xWid.uiDoc).load( function(){
                                let doc = xWid.uiDoc.getElementById('frame').contentDocument;
				xWid.digester.userContent = jQuery("#wpTextbox1",doc).val();
                                xWid.transport.wikiEditDoc = doc;
                                xWid.digester.load();

                        });

			jQuery(".frame", xWid.uiDoc).attr("src", toURL);

                })

		} catch(i) { xWid.dump(i) } 
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
        userName    : null, 

	wikiTab     : null, 
	wikiEditDoc : null, 

  	init: function () { 
		this.wikiTab = jetpack.tabs.open(this.repository); 
		this.wikiTab.focus(); 	// TODO remove the focus to the tab soon
 	}, 

	load: function () { 
		var doc = this.wikiTab.contentDocument; 
		jQuery("a[title^='Edit section: "+this.userName+"']", doc).each( function () {
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
  jetpack.notifications.show("Oh boy, I'm installed! you are running as alpha test so I did set the repository as being mozilla wiki page and also the username");
	if(xWid.localStore.repository) { 
		// In case we have no previous settings.. 
 	} else { 
 		xWid.localStore.repository = "https://wiki.mozilla.org/Education/Projects/JetpackForLearning/Profiles/expressionWidjets/class1"; 
		xWid.localStore.username = "Marcio";
	} 
});


/* Local Resources 
   ---
   Under this section you can keep simply the assets related to HTML and aCSS. These
   elements can get inserted in Documents/UI that is part of this basic JetPack UX. 
*/

xWid.resources = { 
    html_panel: "<button id='goinit'>Init Wiki</button><button id='gofetch'>Fetch Wiki</button><button id='gosave'>Save wiki</button>",
} 

/* 
   Widgets 
   ---
   Check the last line in this code if you want to register your widget
*/

var widgets = { 
	list: new Array(),
	snapshot: {} // SnapShot is our first widget - it can take a screenshot from any page 
	
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
  
  resources     : {

  	style_head     : "html {background:#ddd;} body { text-align:center; margin;auto; }  canvas { border:1px solid black}  ",
  	html_container : "<canvas id='workingcanvas'></canvas>"

  },

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 

	// This is bullshit. We can simple define that every widget icon/button ( that appears 
	// over the slidebar panel, that a title, expected_click function, etc...  ) 

	var obj =  {   
		markup_menu: "<button id='snapshot_do'>Widget:capture</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "snapshot_do",
		click_menu : widgets.snapshot.init,
  	} 
 	return obj;
  },

  init: function () { 

	widgets.snapshot.referenceContentWindow = jetpack.tabs.focused.contentWindow;

	this.canvasTab    = jetpack.tabs.open("about:blank");
	this.canvasTab.focus();
	this.canvasTab.onReady(function(doc) { 

		var namedRefThis = widgets.snapshot; // like 'this', just a ref to the global scope widgets.snapshot

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

