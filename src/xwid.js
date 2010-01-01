/////
//// Expression Widgets 
///
//
jetpack.future.import("selection");   // https://wiki.mozilla.org/Labs/Jetpack/JEP/12
jetpack.future.import("slideBar");    // https://wiki.mozilla.org/Labs/Jetpack/JEP/16

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
		width: 400,
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
			jQuery("body", slide.contentDocument).html("<button id='gofetch'>Fetch Wiki</button>");

			xWid.transport.init();

			jQuery("#gofetch",slide.contentDocument).click( function () { 
				xWid.transport.load();
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

var libCataliser_Wikimedia = { 

	repository  : null, 
	status      : null,
	wikiTab     : null, 
        userName    : null, 

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
                })
	}, 
	grab: function () { 

  	}, 
	sync: function () { 

	} 
} 


