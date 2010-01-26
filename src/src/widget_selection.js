// Uses 
// https://wiki.mozilla.org/Labs/Jetpack/JEP/12  

widgets.selection = { 

  name		: "text/selection",  // name bind that gets exported to the remote respository
  slideDoc      : null, 
  selectedText  : "",

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 
	var obj =  {   
		markup_menu: "<button style='background-color:lightgreen' id='selection_do'>Text/Selection</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "selection_do"
  	} 
 	return obj;
  },

  parse: function (data) { 
	return data; 
  },

  init: function () { 
        jQuery("#widgetscanvas",this.slideDoc).html("<div class='selection'>Type text or select from browser: <br /><input id='widget_selection_field'  ><br /><button id='widget_selection_send'>Send</button></div>");
	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
	jQuery("#widgetscanvas",this.slideDoc).css("background-color","#cec");
	refThis = this; 
	//jQuery("#widget_selection_field",this.slideDoc).focus();
        jQuery("#widget_selection_send",this.slideDoc).click( function () {
		
xWid.dump("!");
		var data = jQuery("#widget_selection_field",refThis.slideDoc).val();

		
                xWid.digester.add(refThis, data);
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
        })

  } , 

  refresh: function () { 
	jQuery("#widget_selection_field", this.slideDoc).css("background-color","lightgreen");
	jQuery("#widget_selection_field", this.slideDoc).val(this.selectedText);
  } 
} 

// Register 
widgets.list[widgets.selection.name] = widgets.selection; 

// Extra https://wiki.mozilla.org/Labs/Jetpack/JEP/12
jetpack.selection.onSelection(function keepText() {

    widgets.selection.selectedText = jetpack.selection.text; 
    widgets.selection.refresh(); 

});

xWid.cssStack_slidebar.push("#widgetscanvas .selection  { text-align:center; padding:.5em  } #widgetscanvas .selection input { width:100% }   #widgetscanvas .selection button { margin:.5em }  ");

