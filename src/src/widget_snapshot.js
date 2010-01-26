
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
    style_head     : "html {background:#ecc;} body { text-align:center; margin;auto; }  canvas { border:5px solid black}  ",
    html_container : "<canvas id='workingcanvas'></canvas>"
  },


  parse: function (data) {
        return "<img src='"+data+"' />";
  },

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 

	var obj =  {   
		markup_menu: "<button style='background:#fcc' id='snapshot_do'>Capture</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "snapshot_do"
  	} 
 	return obj;
  },

  init: function () { 

	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
	jQuery("#widgetscanvas",this.slideDoc).css("background-color","#ecc");
        jQuery("#widgetscanvas",this.slideDoc).html("Select area from the taken page screenshot.");

	this.edited = false; 
	this.editor.on = false; 

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
		xWid.dump("snapshot:"+ namedRefThis.referenceContentWindow);

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
	jQuery("body",this.editorDoc).append("<h2>Screenshot selected!</h2><p>Click Send to send this image to your history <button id='widget_snapshot_addbutton'>Send</button> or simply close this tab to give up. ");
        jQuery("#widgetscanvas",this.slideDoc).html("Click the Send button to add the image. <button id='widget_snapshot_send'>Send</button>");

        jQuery("#widget_snapshot_send",this.slideDoc).click( function () {
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
		xWid.digester.add(widgets.snapshot, widgets.snapshot.canvas.toDataURL("image/png",""));
        })

	jQuery("#widget_snapshot_addbutton",this.editorDoc).click( function () { 
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
		xWid.digester.add(widgets.snapshot, widgets.snapshot.canvas.toDataURL("image/png",""));
		refThis.canvasTab.contentWindow.close();
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

//widgets.list.push(widgets.snapshot); 
widgets.list[widgets.snapshot.name] = widgets.snapshot;

xWid.cssStack_slidebar.push(".statement img { width:64px; } ");

