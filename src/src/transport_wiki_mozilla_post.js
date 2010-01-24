var libCataliser_post = { 

        repository  : null,
        status      : null,
        login    : null,

        wikiDoc     : null,
        wikiTab     : null, 
        bufferFrame : null, 
        bufferFrameLoadCallback : function () { } , 
        wikiEditDoc : null,

 	helper_login: function () { 
   		this.wikiTab = jetpack.tabs.open(this.repository);
                this.wikiTab.focus();   // TODO remove the focus to the tab soon
    	}, 

        init: function () {
		var stampedThis = this; 
		if(!this.bufferFrame) { 
 			jQuery("body",xWid.uiDoc).append('<iframe id="frame" class="frame" class="width:160px" src="about:blank"></frame>');	
		 	this.bufferFrame = xWid.uiDoc.getElementById("frame");
			jQuery(".frame", xWid.uiDoc).load( function () { stampedThis.bufferFrameLoadCallback() } );
 		} 
		this.bufferFrameLoadCallback =  function(){
				stampedThis.wikiDoc = xWid.uiDoc.getElementById('frame').contentDocument;
				stampedThis.load();	
				stampedThis.isloading=false;
				xWid.loadingOff();
		};
      		jQuery(".frame", xWid.uiDoc).attr("src", this.repository);
		this.isloading=true;
		xWid.loadingOn(); // animation
        },

        load: function () {

		var doc = this.wikiDoc; 
		var foundLogin = false; 
		var stampedThis = this; 
                jQuery("a[title^='Edit section: "+this.login+"']", doc).each( function () {
                        item = jQuery(this).attr("href");
	
			// warning replace this to the base for the wiki site

                        var toURL = "https://wiki.mozilla.org"+item;
			foundLogin = true; 

		 	stampedThis.isloading=true;	
			xWid.loadingOn();

			stampedThis.bufferFrameLoadCallback = function () { 
				stampedThis.isloading=false;
				xWid.loadingOff();
				
				// warning - just moved here to load the text
				// content area just one time. 

				xWid.digester.init(xWid.uiDoc);
                                let doc = xWid.uiDoc.getElementById('frame').contentDocument;
				xWid.digester.userContent = jQuery("#wpTextbox1",doc).val();
                                xWid.transport.wikiEditDoc = doc;
                                xWid.digester.load();
			} 
			jQuery(".frame", xWid.uiDoc).attr("src", toURL);

                })

		if(!foundLogin) { 
			jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
			jQuery("#notificationpanel",xWid.uiDoc).append(xWid.resources.html_login_helper);
			this.helper_login();
			jQuery("#gotry",xWid.uiDoc).click( function () { 
				jQuery("#notificationpanel",xWid.uiDoc).html("");
				jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
				xWid.transport.init();
			});
		} else { 
			jQuery("#goinit", xWid.uiDoc).html("Expressing ON");
			jQuery("#goinit", xWid.uiDoc).attr("disabled","disabled");
			jQuery("#gosave", xWid.uiDoc).removeAttr("disabled");
			jQuery("#historypanel", xWid.uiDoc).css("display","block");
			jQuery("#widgetspanel", xWid.uiDoc).css("display","block");
		} 

        },
        grab: function () {

        },
        sync: function (dataContentString) {
		let stampedThis = this; 

 		stampedThis.bufferFrameLoadCallback = function () {
                                stampedThis.isloading=false;
                                xWid.loadingOff();
				xWid.dump("Saved...");
				stampedThis.load();
				xWid.dump("Loading again in edit mode....");
                }

                jQuery("#wpTextbox1", this.wikiEditDoc).val(dataContentString);

		stampedThis.isloading = true; 
		xWid.loadingOn();
                jQuery("#wpSave",this.wikiEditDoc).trigger("click");
		
		
        }

} 
