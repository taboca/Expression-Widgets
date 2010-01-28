
widgets.textify = { 

  name		: "text/textify", 
  slideDoc      : null, 
  selectedText  : "",
  contentTab    : null, 

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 
	var obj =  {   
		markup_menu: "<button style='background-color:lightgreen' id='textify_do'>Textify</button>",
		init_bind_id: "textify_do"
  	} 
 	return obj;
  },

  parse: function (data) { 
	return data; 
  },

  init: function () { 
        jQuery("#widgetscanvas",this.slideDoc).html("<div class='textify'>Type textify equation <br /><input id='widget_textify_field' value='x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}' ><br /><button id='widget_textify_send'>Render</button></div>");
	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
	jQuery("#widgetscanvas",this.slideDoc).css("background-color","#cec");
	refThis = this; 
	//jQuery("#widget_textify_field",this.slideDoc).focus();
        jQuery("#widget_textify_send",this.slideDoc).click( function () {
		
xWid.dump("!");
		var data = jQuery("#widget_textify_field",refThis.slideDoc).val();

		refThis.openTab(jQuery("#widget_textify_field",refThis.slideDoc).val());

/*
                xWid.digester.add(refThis, data);
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
*/
        })

  } , 

  openTab: function ( expURL ) { 
	var encoded = escape(expURL); 
	var fullURL = "http://www.texify.com/img/%5Cnormalsize%5C%21"+expURL".gif";

        this.contentTab = jetpack.tabs.open(fullURL);
        this.contentTab.focus();
        this.contentTab.onReady(function(doc) {
	} 
  },

  refresh: function () { 
	jQuery("#widget_textify_field", this.slideDoc).css("background-color","lightgreen");
	jQuery("#widget_textify_field", this.slideDoc).val(this.selectedText);
  } 
} 

// Register 
widgets.list[widgets.textify.name] = widgets.textify; 

xWid.cssStack_slidebar.push("#widgetscanvas .textify  { text-align:center; padding:.5em  } #widgetscanvas .textify input { width:100% }   #widgetscanvas .textify button { margin:.5em }  ");

