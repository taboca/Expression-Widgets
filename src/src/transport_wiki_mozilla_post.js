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
 	helper_instructions: function () { 
   		this.wikiTab = jetpack.tabs.open("http://taboca.github.com/Expression-Widgets/instructions.html");
                this.wikiTab.focus();   // TODO remove the focus to the tab soon
    	}, 

 	helper_nouser_login: function () { 
   		this.wikiTab = jetpack.tabs.open(this.repository);
                this.wikiTab.focus();   // TODO remove the focus to the tab soon
    	}, 

        init: function () {
		var stampedThis = this; 
		if(!this.bufferFrame) { 
 			jQuery("body",xWid.uiDoc).append('<iframe id="frame" class="frame"  src="about:blank"></iframe>');	
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

	// This function is temporary 
	findDocBase: function () { 
		var chunks = this.repository.split("/");
		var base = chunks[0]+"/"+chunks[1]+"/"+chunks[2];
		return base; 
	}, 

        load: function () {

		var doc = this.wikiDoc; 
		var foundLogin = -1; 
		var stampedThis = this; 

		var loginSimpleTrap = this.login.replace(/^\s+|\s+$/g,""); 

		if(loginSimpleTrap=="") { 
			foundLogin = -2; 
		} else { 
			jQuery("a[title^='Edit section: "+this.login+"']", doc).each( function () {
				var item = jQuery(this).attr("href");
				var toURL = stampedThis.findDocBase() + item;
				foundLogin = 1; 
				stampedThis.isloading=true;	
				xWid.loadingOn();
				stampedThis.bufferFrameLoadCallback = function () { 
					stampedThis.isloading=false;
					xWid.loadingOff();
					xWid.digester.init(xWid.uiDoc);
					let doc = xWid.uiDoc.getElementById('frame').contentDocument;
					xWid.digester.userContent = jQuery("#wpTextbox1",doc).val();
					xWid.transport.wikiEditDoc = doc;
					xWid.digester.load();
				} 
				jQuery(".frame", xWid.uiDoc).attr("src", toURL);
                	});
		} 

		if(foundLogin == 1)  { 
			jQuery("#goinit", xWid.uiDoc).html("Expressing ON");
			jQuery("#goinit", xWid.uiDoc).attr("disabled","disabled");
			jQuery("#gosave", xWid.uiDoc).removeAttr("disabled");
			jQuery("#historybgcontainer", xWid.uiDoc).css("display","block");
			jQuery("#widgetspanel", xWid.uiDoc).css("display","block");
		} 
		if(foundLogin == -1) { 
			jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
			jQuery("#notificationpanel",xWid.uiDoc).append(xWid.resources.html_login_helper);
			this.helper_login();
			jQuery("#gotry",xWid.uiDoc).click( function () { 
				jQuery("#notificationpanel",xWid.uiDoc).html("");
				jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
				xWid.transport.init();
			});
		}
		if(foundLogin == -2) {
                        jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
                        jQuery("#notificationpanel",xWid.uiDoc).append(xWid.resources.html_login_nouser_helper);
                        this.helper_nouser_login();
			let refThis = this; 
                        jQuery("#gotry",xWid.uiDoc).click( function () {
                                jQuery("#notificationpanel",xWid.uiDoc).html("");
                                jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
                                xWid.transport.init();
                        });
                        jQuery("#gohelp",xWid.uiDoc).click( function () {
				refThis.helper_instructions();
                        });
                } 
        },
        grab: function () {

        },
        sync: function (dataContentString) {
		let stampedThis = this; 

 		stampedThis.bufferFrameLoadCallback = function () {
                                stampedThis.isloading=false;
				jQuery("#gosave", xWid.uiDoc).removeAttr("disabled");
                                xWid.loadingOff();
				xWid.dump("Saved...");
				stampedThis.load();
				xWid.dump("Loading again in edit mode....");
                }

                jQuery("#wpTextbox1", this.wikiEditDoc).val(dataContentString);

		stampedThis.isloading = true; 
		xWid.loadingOn();

		jQuery("#gosave", xWid.uiDoc).attr("disabled","disabled");
                jQuery("#wpSave",this.wikiEditDoc).trigger("click");
        }

} 
