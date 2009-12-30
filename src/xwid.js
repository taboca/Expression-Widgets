/////
//// Expression Widgets 
///
//
jetpack.future.import("selection");

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
    setTimeout("xWid.launchForGrab("+currWin+","+x+","+y+","+w+","+h+")", 2000 );

});

////
/// xWid is a general widget behavior. At this point we have things ( all the widget behaviors ) hardcoded 
/// in this same file. This may change in the future. 
//
var xWid = { 

   launchForGrab : function (currWin,x,y,w,h){
    var t = this, canvas;
    t.tabProperties = new Array();
    t.tabsIndex = new Array();
    t.tabProperties = jetpack.tabs.open("about:blank");
    t.tabProperties.focus();
    t.tabProperties.onReady( function(doc){
      jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append("body{background:#131313;color:white;text-align:center;} canvas{cursor:pointer;opacity:0.5;}canvas:hover{opacity:1;}");
     canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
     jQuery(canvas).appendTo(jQuery("body",doc));
     xWid.createPreviewFromArea( currWin ,x,y,w,h, canvas);

    });
  }, 
  createPreviewFromArea : function(cw, x,y,w,h, canvas){
    canvas.width=w;
    canvas.height=h;
    canvas.getContext("2d").drawWindow(cw, x, y, w,h, "white");
    return canvas;
  }

}  // End of general widget code 


