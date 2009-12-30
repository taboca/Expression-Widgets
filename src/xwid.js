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
   slideContent: null, 
 
   launchForGrab : function (currWin,x,y,w,h){
    this.canvasTab = jetpack.tabs.open("about:blank");
    this.canvasTab.focus();

    this.canvasTab.onReady( function(doc){
      jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append("body{background:#131313;color:white;text-align:center;} canvas{cursor:pointer;opacity:0.5;}canvas:hover{opacity:1;}");
     this.canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
     jQuery(this.canvas).appendTo(jQuery("body",doc));
     xWid.createPreviewFromArea( currWin ,x,y,w,h, this.canvas);

    });
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
	this.slideContent = jetpack.slideBar.append({
		url: "about:blank",
		width: 400,
 		persist: true, 
		onClick: function(slide) {
			slide.icon.src = "chrome://branding/content/icon48.png";
		},   
                onReady: function(slide) { 
			jQuery("body", slide.contentDocument).html("Hello - Welcome to Expression Widgets");
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
    xWid.init();

});

