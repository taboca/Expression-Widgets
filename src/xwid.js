/////
//// Expression Widgets 
///
//
jetpack.future.import("selection");   // https://wiki.mozilla.org/Labs/Jetpack/JEP/12
jetpack.future.import("slideBar");    // https://wiki.mozilla.org/Labs/Jetpack/JEP/16
jetpack.future.import("me"); 

/// in this same file. This may change in the future. 
//
var xWid = { 

   canvas: null, 
   canvasTab: null, 

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
			xWid.transport = libCataliser_Wikimedia; 
			xWid.transport.repository = "https://wiki.mozilla.org/Education/Projects/JetpackForLearning/Profiles/expressionWidjets/class1"; 
			xWid.transport.userName = "Marcio";

			xWid.uiDoc= slide.contentDocument; 
			jQuery("body", slide.contentDocument).html("<button id='goinit'>Init Wiki</button><button id='gofetch'>Fetch Wiki</button><button id='gosave'>Save wiki</button>");


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
                }
	});
  } 

}  // End of general widget code 

xWid.init();

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


// Lib Transport 

xWid.digester = { 

	slideDoc        : null, 
        userContent     : null,  /* content from the wiki */
        cycle 		: null,  // state machine r/w modes etc

	init: function (refDocument) { 
		this.slideDoc = refDocument;
		jQuery("body",this.slideDoc).append("<div id='wikisection'><textarea id='wikitextarea'></textarea></div>");
		
	}, 
 	load: function () { 
		jQuery("#wikitextarea",this.slideDoc).val(this.userContent);
	}, 
	refreshSelfTextArea: function () { 
		this.userContent = jQuery("#wikitextarea",this.slideDoc).val();
	} , 
 
	// We now parse the items from the wiki section to have the 
	// in-memory events. 

  	parse: function () { 

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
  jetpack.notifications.show("Oh boy, I'm installed!");
});



/* 
   Widgets 
*/

var widgets = { 
	list: new Array
} 

widgets.snapshot = { 

  referenceTab  : null, 
  canvasTab     : null,
  canvas        : null, 

  register: function () { 
	return {   
		markup_menu: "<button>C</button>",
		markup_init: "<button>get</button",
		click_menu : widgets.snapshot.init,
		click_init : widgets.snapshot.close
  	} 
  },

  resources.style_head     = "html { background:white; }",
  resources.html_container = "<canvas id='workingcanvas'></canvas>",

  init: function () { 
	this.referenceTab = jetpack.tabs.focused; 
	this.canvasTab    = jetpack.tabs.open("about:blank");
	this.canvasTab.onReady = function(doc) { 

		these = widgets.snapshot;

		jQuery("head title",doc).text("xWidgets: Snapshot");
		jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append( these.resources.style_head );
    		jQuery("body",doc).append( these.resources.html_container );

		these.canvas = doc.getElementById("workingcanvas");

		these.createPreviewRaw(these.referenceTab, these.canvas, 0,0, 600, 300);
        } 
  }, 


  createPreviewRaw: function (tab, canvas, x,y,dx,dy) {

    var content = tab.contentWindow;
    var w = content.innerWidth  + content.scrollMaxX;
    var h = content.innerHeight + content.scrollMaxY;

    var ctx = canvas.getContext("2d");

    var refWidth = 600;
    var scaleView = refWidth/w;
    var canvasStyleH = Math.round(h*scaleView);

    var sl = JetBin.editor.doc.body.scrollLeft;
    var st = JetBin.editor.doc.body.scrollTop;
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


/* 
 * We keep the registered widgets 
 * We may change this to be jetpack-based widgets in the future..
 * .. in case we find a way to let them talk each other...
 */
widgets.list.push(widgets.snapshot); 

