
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

  parse: function(data) { 
 	return data;	
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

//widgets.list.push(widgets.text); 
widgets.list[widgets.text.name] = widgets.text;

