
widgets.textify = { 

  name		: "text/textify", 
  slideDoc      : null, 
  iframe 	: null, 
  selectedText  : "",
  fullURL	: "",

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 
	var obj =  {   
		markup_menu: "<button style='background-color:#ffa' id='textify_do'>Textify</button>",
		init_bind_id: "textify_do"
  	} 
 	return obj;
  },

  parse: function (data) { 
	return "<img src='"+data+"' />"; 
  },

  init: function () { 

        jQuery("#widgetscanvas",this.slideDoc).html("<div class='textify'>Type textify equation <br /><input id='widget_textify_field' value='' ><br /><button id='widget_textify_render'>Render</button><button id='widget_textify_help'>Help</button><br /><div id='widget_textify_canvas'></div></div>");
	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
	jQuery("#widgetscanvas",this.slideDoc).css("background-color","#ffa");
	refThis = this; 
        jQuery("#widget_textify_help",this.slideDoc).click( function () {
		
		var page = jetpack.tabs.open("http://www.texify.com/");
		page.focus();

	});

        jQuery("#widget_textify_render",this.slideDoc).click( function () {

		var data = jQuery("#widget_textify_field",refThis.slideDoc).val();
		var encoded = escape(data); 
		refThis.fullURL = "http://www.texify.com/img/%5Cnormalsize%5C%21"+ encoded +".gif";

		if(refThis.iframe) { 
			refThis.iframe.attr("src",refThis.fullURL);
  		} else {
	                jQuery("#widget_textify_canvas", refThis.slideDoc).append('<iframe id="widget_textify_frame" class="widget_textify_frame" src="'+refThis.fullURL+'"></iframe>');

			refThis.iframe = jQuery("#widget_textify_frame",refThis.slideDoc); 

			jQuery("#widgetscanvas", refThis.slideDoc).append("<button id='widget_textify_send'>Send</button>");
			jQuery("#widget_textify_send", refThis.slideDoc).click(function() { 
       	         		xWid.digester.add(refThis, refThis.fullURL);
       	        	 	jQuery("#widgetscanvas",refThis.slideDoc).html("");
				refThis.iframe=null;
       		       		jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
			});

		} 
        });
  } 
} 

// Register 
widgets.list[widgets.textify.name] = widgets.textify; 

xWid.cssStack_slidebar.push("#widgetscanvas .textify  { text-align:center; padding:.5em  } #widgetscanvas .textify input { width:100% }   #widgetscanvas .textify button { margin:.5em } #widget_textify_frame { width:200px; height:70px;background-color:white; border:1px solid black} ");

