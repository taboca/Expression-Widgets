
widgets.drop = { 

  name		: "text",  // name bind that gets exported to the remote respository
  slideDoc      : null, 
  selectedText  : "",

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 
	var obj =  {   
		markup_menu: "<button style='background-color:#cce' id='drop_do'>Drop</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "drop_do"
  	} 
 	return obj;
  },


  parse: function (data) {
        return data;
  },


  dropOn: function (e) { 
	e.preventDefault();
	var data = e.dataTransfer.getData("text/plain");
	e.target.textContent = data;

        jQuery("#widgetscanvas",this.slideDoc).html(data +" <button id='widget_drop_button_send'>Send</button>")
	refThis = this; 
	jQuery("#widget_drop_button_send",this.slideDoc).click( function() { 
		xWid.digester.add(refThis, data);
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
	});
	return true;
  },

  init: function () { 

	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
	jQuery("#widgetscanvas",this.slideDoc).css("background-color","#cce");
        jQuery("#widgetscanvas",this.slideDoc).html("<div style='padding:2em' id='widget_drop_droparea'  >Drop something here... </div>");

	refThis = this; 

	this.slideDoc.getElementById('widget_drop_droparea').addEventListener("drop", function (e) { return refThis.dropOn(e) } , false);
	this.slideDoc.getElementById('widget_drop_droparea').addEventListener("dragenter", function (e) { e.preventDefault(); return false } , false);
	this.slideDoc.getElementById('widget_drop_droparea').addEventListener("dragover", function (e) { e.preventDefault(); return false } , false);

  }  

} 

// Register 
//widgets.list.push(widgets.drop); 
widgets.list[widgets.drop.name] = widgets.drop;

