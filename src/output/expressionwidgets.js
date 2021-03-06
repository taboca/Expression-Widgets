//////
/////
////         Expression Widgets - JetPack for Learning 2010
///
//

/* JEP Profile Disclaimer 
   ---
*/

// https://wiki.mozilla.org/Labs/Jetpack/JEP/12
jetpack.future.import("selection");   
// https://wiki.mozilla.org/Labs/Jetpack/JEP/16
jetpack.future.import("slideBar"); 
jetpack.future.import("me"); 
// https://developer.mozilla.org/en/Jetpack/Storage/Simple_storage
jetpack.future.import("storage.simple");

/* App Core 
   --- 
   The xWid is the application code. We have here the basic user experience so 
   the user/participant can feel they can use this app to engage in a give 
   collaboration session, associate their user with the remote repository, 
   and also means to deal with the widgets. We now keep the widget codes 
   separated from this. So, from a certain angle, the Expression Widgets, 
   is like JetPack. It aims to create a model that Widgets can work together
   and load/post/sync with the repository ( contribution from others ). 
*/

var xWid = { 

  canvas    : null, 
  canvasTab : null, 
 
  localStore: jetpack.storage.simple,  // This is the interface to the local 
					   // and persistant storage service. 
  resources : null, // check for xWid.resources section in this file... 
  uiDoc     : null, 
  transport : null,       // This is a plugin. See the build system. 
  digester  : null,       // This is a plugin. See the build system. 
  overlay   : null, 	  // This is a plugin. See the build system. 

  icon: null, 
  thisIsFirstRun: null, 
  baseURL_guidepage : "http://taboca.github.com/Expression-Widgets/guide-en-0.6.html",
    
  cssStack_slidebar: new Array(), 
 
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
  dump: function (str) { 
	jQuery("#debug",this.uiDoc).append(str);

  } ,
  settingsChanged: function () { 
 	this.localStore.login       = jQuery("#login",     xWid.uiDoc).val();
 	this.localStore.repository  = jQuery("#repository",xWid.uiDoc).val();
	jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
        jQuery("#notificationpanel",xWid.uiDoc).html("Just saved your screenname URL settings. <button id='godone'>Done</button>");

	jQuery("#godone",xWid.uiDoc).click( function () {
		jQuery("#notificationpanel",xWid.uiDoc).html("");
		jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
	});

	xWid.transport.repository = xWid.localStore.repository;
	xWid.transport.login      = xWid.localStore.login;

	xWid.digester.clean();
	jQuery("#goinit", xWid.uiDoc).html("Enable");
	this.checkLoginRepoStates();
  },

  loadingOn: function () { 
	jQuery("#loadingfeedback",this.uiDoc).css("display","inline");
  }, 
  loadingOff: function () { 
	jQuery("#loadingfeedback",this.uiDoc).css("display","none");
  },
  checkLoginRepoStates: function () { 

	xWid.dump("(core) checking login and repository strings.. ");
	var loginCheck = xWid.transport.login.replace(/^\s+|\s+$/g,"");
	var repoCheck  = xWid.transport.repository.replace(/^\s+|\s+$/g,"");
	if(loginCheck =="") { 
		jQuery("#goinit", this.uiDoc).attr("disabled","true");	
	} else { 
		jQuery("#goinit", this.uiDoc).removeAttr("disabled");
	} 
	if(repoCheck =="") { 
		jQuery("#goclass", this.uiDoc).attr("disabled","true");	
	} else { 
		jQuery("#goclass", this.uiDoc).removeAttr("disabled");
	} 

	if(loginCheck =="" || repoCheck == "") { 

		jQuery("#notificationpanel",xWid.uiDoc).html("");
		jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
                jQuery("#notificationpanel",xWid.uiDoc).append(xWid.resources.html_login_noinfo_helper);
		let refThis = this;

		let contentDoc = jetpack.tabs.focused.contentDocument;
		xWid.dump("Page current location toString = " + contentDoc.location.toString() +" and indexOf is " + contentDoc.location.toString().indexOf(xWid.baseURL_guidepage));

		jQuery("#gohelp",xWid.uiDoc).click( function () {
			jQuery("#notificationpanel",xWid.uiDoc).html("Intructions are loaded in your browser tab.");
			//jQuery("#notificationpanel",xWid.uiDoc).css("display","none");
			//let help = jetpack.tabs.open("http://taboca.github.com/Expression-Widgets/instructions.html");
                        let contentDoc = jetpack.tabs.focused.contentDocument;
			if(contentDoc.location.toString().indexOf(xWid.baseURL_guidepage)>-1) { 
                        	contentDoc.location= xWid.baseURL_guidepage+"?#show=setup";
			} else {  
				let help = jetpack.tabs.open(xWid.baseURL_guidepage + "?#show=setup");
				help.focus(); 
			} 
		});
	} 

  },
  ////
  /// man init point
  //
  init: function () { 
	this.uiDoc = jetpack.slideBar.append({
		url: "about:blank",
		width: 300,
 		persist: true, 
		onClick: function(slide) {
			slide.icon.src = "chrome://branding/content/icon48.png";
                        this.icon = slide.icon;
                        if(xWid.thisIsFirstRun) {
			  xWid.thisIsFirstRun=false;
                          let contentDoc = jetpack.tabs.focused.contentDocument;
                          contentDoc.location= xWid.baseURL_guidepage+"?#show=setup";
                        }
			xWid.checkLoginRepoStates();
		},   
                onReady: function(slide) { 
			xWid.uiDoc = slide.contentDocument; 	
			// This is a little framework to let others to add new style to the slidebar..
			var cssBuffer = "";
			for (var key in xWid.cssStack_slidebar) { 
				cssBuffer += xWid.cssStack_slidebar[key];				
				xWid.dump("Adding.. " + cssBuffer );
 			} 

			jQuery(slide.contentDocument.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",slide.contentDocument)).append( xWid.resources.style_slidebar_head + cssBuffer );

			// end..

			jQuery("body", slide.contentDocument).html(xWid.resources.html_panel);

			xWid.transport.login      = xWid.localStore.login; 
			xWid.transport.repository = xWid.localStore.repository; 

 			jQuery("#login", slide.contentDocument).val(xWid.transport.login); 
 			jQuery("#repository", slide.contentDocument).val(xWid.transport.repository); 
			jQuery("#login", slide.contentDocument).change( function () { 
				xWid.settingsChanged();
			});
			jQuery("#repository", slide.contentDocument).change( function () { 
				xWid.settingsChanged();
			});

			jQuery("#goinit",slide.contentDocument).click( function () { 
				xWid.transport.init();
			});
			jQuery("#goclass",slide.contentDocument).click( function () { 

				xWid.overlay.start();
			});
			jQuery("#gosave",slide.contentDocument).click( function () { 
				jQuery("#gosave",slide.contentDocument).removeClass("saveneeded");
				xWid.digester.serialize();
				//xWid.dump(xWid.digester.userContent);
				xWid.transport.sync(xWid.digester.userContent);
			});

			jQuery("#goproject", slide.contentDocument).click(function () { 
	                        let help = jetpack.tabs.open(xWid.baseURL_guidepage);
				help.focus();
				return false;


			});


			// We check the initial state. If we have no username and repository 
			// then we simply point the basic instructions. 

	
			xWid.checkLoginRepoStates();

			// Notice we populate the widgets here in the menu but we dont yet 
			// enable the #widgetspanel UI element .. only if they are logged in 
			// soon later on depends on state / wiki flow...

			for (key in widgets.list) { 
				let currWidget = widgets.list[key];
				let objRegister = currWidget.register(slide.contentDocument);
				jQuery("#widgetspanel",slide.contentDocument).append(objRegister.markup_menu);
				jQuery("#"+objRegister.init_bind_id, slide.contentDocument).click (function () { 
					currWidget.init();
				}) 
			} 
			jQuery("#widgetspanel",slide.contentDocument).append("<button style='background-color:#333' id='contribute'>Contribute ..</button>");
			jQuery("#contribute",slide.contentDocument).click( function ()  {
				let help = jetpack.tabs.open(xWid.baseURL_guidepage + "?#show=project");
				help.focus(); 
			});

			// use this to speed up widgets panels in the UI aside from the login state
			// jQuery("#widgetspanel", xWid.uiDoc).css("display","block");

                }
	});
  } 

}  // End of general widget code 

xWid.init();

/* Local Resources 
   ---
   Under this section you can keep simply the assets related to HTML and aCSS. These
   elements can get inserted in Documents/UI that is part of this basic JetPack UX. 
*/

xWid.resources = { 
    html_panel     : "<div id='topheader'><button alt='Visit the project' id='goproject' href='javascript:'>ExpressionWidgets</button><img align='top' width='30' id='loadingfeedback' src='chrome://global/skin/media/throbber.png'></div><table id='mainpanel'><tr><td>Repository:</td><td><input id='repository' type='text' /></td></tr><tr><td>User</td><td><input id='login' type='text' /></td></tr><tr><td align='center' colspan='2' id='topactions'><button class='actionbutton' id='goinit'>Enable</button><button id='gosave' class='actionbutton'  disabled='disabled'>Push Notes</button><button class='actionbutton' id='goclass' title='Visit the Wiki Class URL in overlay mode' >All Notes</button></td></tr></table><div id='notificationpanel'></div> <div id='widgetspanel'></div><div id='widgetscanvas'></div> <div id='historybgcontainer'><div id='historycontainer'><div id='historypanel'></div></div></div> <div id='debug'></div>", 
    html_login_helper: "<div id='helper'><img src='chrome://global/skin/notification/warning-icon.png' /> You are not logged in. Log over the wiki and then click here <button id='gotry'>Retry</button> </div>",
    html_login_nouser_helper: "<div id='helper'><img src='chrome://global/skin/notification/warning-icon.png' /> You don't have the username/wiki settings. Please follow the instructions on how to set your user section in the wiki class repository.  <button id='gotry'>Retry</button> <button style='margin:.5em' id='gohelp'>Setup/Help Instructions</button></div>",
    html_login_noinfo_helper: "<div id='helper'><img src='chrome://global/skin/notification/warning-icon.png' /> You don't have the username/wiki settings. Please follow the instructions on how to set your user section in the wiki class repository. <button style='margin:1em' id='gohelp'>Instructions</button></div>",

    style_slidebar_head: " #loadingfeedback { margin-left:6px; display:none; } table { margin:auto;  margin-top:0em; margin-bottom:0; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:92%; border:6px solid black; background-image: -moz-linear-gradient(top, lightblue, #fff); } table td { padding:.2em }  input { -moz-border-radius:8px; }  #topheader { text-align:center;  color:black; font-weight:bold; margin:auto; margin-top:0; margin-bottom:0; height:32px; width:80%;  padding:.2em } #widgetspanel { display:none; margin:auto; margin-top:0; width:80%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius: 0 0 10px 10px; background-image: -moz-linear-gradient(top, #000, #000);  } #widgetscanvas { display:none; margin:auto; margin-top:.5em; width:90%; padding:.2em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%;  }  #notificationpanel { margin:auto; padding:.5em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:0 0 10px 10px; width: 210px; background-image: -moz-linear-gradient(top, lightyellow, #fff); display:none  } #historybgcontainer { display:none; margin:auto; width:250px; height:300px; padding:.5em; margin-top:.5em; -moz-border-radius:20px; -moz-box-shadow: black 0 0 10px;  background-image: -moz-linear-gradient(top, #fff, #fff);  } #historycontainer {  margin:auto; width:100%; height:100%; overflow:scroll } #historypanel { width:1400px; } #widgetspanel button { -moz-border-radius:8px; border:1px solid black; padding:3px; margin:2px } .statement-notsaved { border-left:5px solid lightgreen; display:block; font-size:86%; font-family:arial; margin-bottom:.5em; -moz-border-radius:10px; padding:6px; background-image: -moz-linear-gradient(top, #fff, #ddd); border-left:5px solid yellow; }  .statement {  border-left:5px solid lightgreen; display:block; font-size:86%; font-family:arial; margin-bottom:.5em; -moz-border-radius:10px; padding:6px; background-image: -moz-linear-gradient(top, #fff, #ddd);} #goproject { border:0; -moz-border-radius:6px; padding:3px; background-color:#ddd; cursor:pointer}  button { cursor: pointer } .actionbutton { background-image: -moz-linear-gradient(top, #ddd, #fff); margin-right:3px; -moz-border-radius:7px; -moz-box-shadow: black 0 0 4px  } .saveneeded { border:3px solid yellow} ",
} 


/* 
   Widgets 
   ---
   Check the last line in this code if you want to register your widget
*/

var widgets = { 
	list: new Array()
} 


/* firstRun */
// https://developer.mozilla.org/en/Jetpack/Meta/First_run

// Revision note: We are not using anymore the static welcome markup. It's just
// here for the sake of an emergency plan. 

var manifest = {  
  
  firstRunPage: <>  

	<div style='padding:2em'>
	<div style="padding:1em;-moz-box-shadow: black 0 0 30px; border: 8px solid black;  -moz-border-radius:30px;background-image: -moz-linear-gradient(top, lightblue, #fff);  ">
	<h1>Welcome to Expression Widgets</h1>
    <p>  
To open the Expression Widgets panel please use the slide bar element on the left acessible using the icon ( <img src='chrome://jetpack/content/gfx/arrowRight.png' /> ) at the left hand corder of your browser window. 
    </p>  
	</div>

	</div>
  </>, 

  firstRunPage: xWid.baseURL_guidepage + "?#show=welcome"  /* Check the ../after settings to see this constant definition */

}; 

jetpack.me.onFirstRun(function () {
	jetpack.notifications.show("Oh boy, I'm installed! you are running as alpha test so I did set the repository as being mozilla wiki page and also the login");

	xWid.thisIsFirstRun=true;
	if(xWid.localStore.repository) { 
		// In case we have no previous settings.. 
 	} else { 
 		xWid.localStore.repository = "https://wiki.mozilla.org/Education/Projects/JetpackForLearning/Profiles/expressionWidjets/class2"; 
		xWid.localStore.login = "";
	} 
});


/* 
 Digester 
 ---
*/

xWid.digester = { 
	
	slideDoc        : null, 
        userContent     : null,  /* content from the wiki */
        cycle 		: null,  // state machine r/w modes etc

	storeIndex	: null, 
        
	time_getMonth: function ( ) {
		var d = new Date(); 
		return d.getMonth();
	}, 
	time_getYear: function ( ) {
		var d = new Date(); 
		return d.getFullYear();
	}, 
	time_getDay: function ( ) {
		var d = new Date(); 
		return d.getDay();
	}, 
	time_getHour: function ( ) {
		var d = new Date(); 
		return d.getHours();
	}, 
	time_getMin: function ( ) {
		var d = new Date(); 
		return d.getMinutes();
	}, 
	time_getSec: function ( ) {
		var d = new Date(); 
		return d.getSeconds();
	}, 
	init: function (refDocument) { 
		this.slideDoc = refDocument;
		//jQuery("#historypanel",this.slideDoc).append("<div id='wikisection'><textarea style='width:100%' id='wikitextarea'></textarea></div><div id='history'></div>");
	
		xWid.dump("Digester init...");	
	}, 

	clean: function () { 
		
                jQuery("#historypanel", this.slideDoc).html("");
	},
	// Digest the data loaded and kept in userContent 
  	// to a new structure that can be displayed, maybe modified 
	// maybe merged with other students. We are trying to understand
 	// the various ways we can digest the information. 


 	load: function () { 
                jQuery("#historypanel", this.slideDoc).html("");
		//var preParse = this.userContent.split("=== "+xWid.transport.login+ " ===");
		var preParse = this.userContent.split("===");
		if (preParse.length==3) { 
			xWid.dump("Found user..");
			var userData = preParse[2].split("*"); 
			this.storeIndex = new Array();
			for (var key in userData) { 
				let currLine = userData[key];
				currLine = jQuery.trim(currLine);
				let dataChunks = currLine.split("  "); 
				let metaChunks = dataChunks[0].split(" ");
				if(metaChunks.length>=2) { 
					let date = metaChunks[0]; 
					let hour = metaChunks[1]; 
				 	let data = dataChunks[1]; 	
					var contentData =""; 
					var appData  ="";
 					try { 
						appData     = data.split("::")[0];
						contentData = data.split("::")[1];
					} catch(i) {  } 

					this.addStore(date, hour, appData, contentData, true); 

				} else { 
					xWid.dump("Not understand statement..");
				} 	
			} 
			this.sortData();
		} 
	}, 

        sortData: function () {
                jQuery("#historypanel", this.slideDoc).html("");

                var keysArray = new Array();
                for (var k in this.storeIndex ) {
                        keysArray.push(k);
                }
                keysArray.sort();
                //for(var i=0;i<keysArray.length;i++) {
                for(var i=keysArray.length-1;i>-1;i--) {

                        jQuery("#historypanel", this.slideDoc).append(this.render(this.storeIndex[keysArray[i]]));
                }
        },
	render: function (node) { 
		let nodeEntry = this.slideDoc.createElementNS("http://www.w3.org/1999/xhtml","span");
		if(node.saved) { 
			nodeEntry.setAttribute("class","statement"); 
		} else { 
			nodeEntry.setAttribute("class","statement-notsaved"); 
		} 
		nodeEntry.setAttribute("date",node.date); 
		nodeEntry.setAttribute("hour",node.hour); 
		nodeEntry.innerHTML=this.parseData(node.app,node.data);
		return nodeEntry;
	}, 

	/* So far we have the various types here hardcoded. But these visualization/parsing needs to be defined in the widget time. */
	parseData: function (app,data) { 
		return widgets.list[app].parse(data);
	},	

        addStore: function ( date, hour, app, data, saved) {
                var nodeEntry = {
		       saved: saved, 
                       date: date,
                       hour: hour,
                       app : app,
                       data: data
                }
                this.storeIndex[date+hour] = nodeEntry;
        },
        add: function ( refWidget, data) {
                var yy = this.time_getYear();
                var mo = this.time_getMonth(); 
                var dd = this.time_getDay(); 

                var date = yy+"-"+mo+"-"+dd; 

                var hh = this.time_getHour(); 
                var mm = this.time_getMin(); 
                var ss = this.time_getSec(); 

		if(parseInt(ss)<10) { ss="0"+ss } 
		if(parseInt(mm)<10) { mm="0"+mm } 
		if(parseInt(hh)<10) { hh="0"+hh } 
                
                var hour = hh+":"+mm+":"+ss; 

                this.addStore(date, hour, refWidget.name, data, false);
//              var sortableDateTimeStamp = yy+"-"+mo+"-"+dd+" "+hh+":"+mm+":"+ss+" ";  
//              this.userContent = this.userContent + "\n * "+ sortableDateTimeStamp +" "+refWidget.name+"::"+data + "\n" ;
                //jQuery("#wikitextarea", this.slideDoc).val( this.userContent );
		jQuery("#gosave",this.slideDoc).addClass("saveneeded");
		this.sortData();
        }, 

        serialize: function () { 
                var prefix = "=== "+xWid.transport.login+ " ===\n";
                this.userContent = prefix;
                var keysArray = new Array();
                for (var k in this.storeIndex ) {
                        keysArray.push(k);
                }
                keysArray.sort();
                for(var i=0;i<keysArray.length;i++) {
                        var current = this.storeIndex[keysArray[i]];
                        let sortableDateTimeStamp = current.date+" "+current.hour; 
                        this.userContent = this.userContent + "\n * "+ sortableDateTimeStamp +"  " +current.app+"::"+current.data + "\n" ;
                }
        } 

} 

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
			jQuery("#goinit", xWid.uiDoc).html("Enabled");
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

widgets.drop = { 

  name		: "text/drop",  // name bind that gets exported to the remote respository
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


/* Please code your widget here using the format widgets.widgetname.... 
   Notice that each widget has some expected "interface" functions 
   so that the main app can load them. For now the register function returns the markup 
   "the icon of the app" that gets inserted to the slidebar... 
*/ 

widgets.snapshot = { 

  name		: "image/snapshot",  // name bind that gets exported to the remote respository
  referenceContentWindow  : null, 
  canvasTab     : null,
  canvas        : null, 
  slideDoc      : null, 
  edited        : false, 

  // These for the editor that happens when the New Tab is opened  
  editorDoc     : null, 
  editor:  { axis_x: null, axis_y: null, x:0, y:0, on: false, box:null, ww: 0, hh:0  }, 
   
  resources: {
    style_head     : "html {background:#ecc;} body { text-align:center; margin;auto; }  canvas { border:5px solid black}  ",
    html_container : "<canvas id='workingcanvas'></canvas>"
  },


  parse: function (data) {
        return "<img src='"+data+"' />";
  },

  register: function (slideDoc) { 
	
	this.slideDoc = slideDoc; 
	refThis = this; 

	var obj =  {   
		markup_menu: "<button style='background:#fcc' id='snapshot_do'>Capture</button>",
		markup_init: "<button>get</button>",
		init_bind_id: "snapshot_do"
  	} 
 	return obj;
  },

  init: function () { 

	jQuery("#widgetscanvas",this.slideDoc).css("display","block");
	jQuery("#widgetscanvas",this.slideDoc).css("background-color","#ecc");
        jQuery("#widgetscanvas",this.slideDoc).html("<div class='snapshot'>Select area from the taken page screenshot. WARNING - SELECT SMALL AREA OF THE PAGE to send fewer bytes to MOZILLA WIKI. </div>");

	this.edited = false; 
	this.editor.on = false; 

	widgets.snapshot.referenceContentWindow = jetpack.tabs.focused.contentWindow;

	this.canvasTab    = jetpack.tabs.open("about:blank");
	this.canvasTab.focus();
	this.canvasTab.onReady(function(doc) { 

		var namedRefThis = widgets.snapshot; 

		// We populate the new Opened Tab with a canvas tag so that we can capture the previously opened 
		// default tab screenshot onto this Tab, this canvas... 

		jQuery("head title",doc).text("xWidgets: Snapshot");
		jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append( namedRefThis.resources.style_head );
		namedRefThis.canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");

    		jQuery("body",doc).append( namedRefThis.canvas );
		xWid.dump("snapshot:"+ namedRefThis.referenceContentWindow);

		// Take the screenshot! 
		// widgets.snapshot.createPreviewRaw(namedRefThis.referenceContentWindow, namedRefThis.canvas);
		namedRefThis.createPreviewFixed(namedRefThis.referenceContentWindow, namedRefThis.canvas);
	
		// Keep this Tab document at our global scope so that the user can edit the canvas later on 
		namedRefThis.editorDoc = doc; 

		namedRefThis.editorInit();  	// let's initialize the events in the new opened Tab so that 
					// user can drag and select a portion of the screeenshot 
 
        } )
		
  }, 

  createPreviewFixed: function (content, canvas) {
    var w = content.innerWidth  + content.scrollMaxX;
    var h = content.innerHeight + content.scrollMaxY;
    var ctx = canvas.getContext("2d");
    var scaledWidth = 600; 
    var scaledHeight = (h*scaledWidth)/w;
    canvas.style.width  = scaledWidth  +"px";
    canvas.style.height = scaledHeight +"px";
    canvas.width  = scaledWidth;
    canvas.height = scaledHeight;
    ctx.scale(scaledWidth/w,scaledHeight/h);
    ctx.clearRect(0, 0, w,h);
    ctx.save();
    ctx.drawWindow(content, 0, 0, w, h, "rgb(255,255,255)");
    ctx.restore();
    return canvas;
  }, 
   
  //// 
  /// Initiaze an editor 
  // 
  editorInit: function () {
	var namedRefThis = this;  // keep a named reference to this current scope so we can pass to the inline 
 			   // function associated with the event listeners... 
        this.editorDoc.addEventListener("mousemove", function (e) { namedRefThis.editorBoxCross(e) } , false);
        this.editorDoc.addEventListener("mouseup",   function (e) { namedRefThis.editorBoxOff(e) } ,   false);
        this.editorDoc.addEventListener("mousedown", function (e) { namedRefThis.editorBoxOn(e) } ,    false);
        jQuery("body", this.editorDoc).append("<div id='editorboxaxisx' style='border:1px dotted gray;position:absolute;width:1px;'></div>");
        jQuery("body", this.editorDoc).append("<div id='editorboxaxisy' style='border:1px dotted gray;position:absolute;height:1px;;'></div>");
        this.editor.axis_x = jQuery("#editorboxaxisx", this.editorDoc);
        this.editor.axis_y = jQuery("#editorboxaxisy", this.editorDoc);
        this.editor.axis_x.css("left", this.editor.x  +"px");
        this.editor.axis_y.css("top",  this.editor.y  +"px");
  },
  editorBoxOn: function(e) {
        if(!this.editor.on && !this.edited) {
                this.editor.on = true;
                var sl = this.editorDoc.body.scrollLeft;
                var st = this.editorDoc.body.scrollTop;
                var leftCanvas = this.canvas.getBoundingClientRect().left + sl;
                var topCanvas  = this.canvas.getBoundingClientRect().top  + st;
                var xx = (e.clientX+sl);
                var yy = (e.clientY+st);
                this.editor.x = xx;
                this.editor.y = yy;
                if(xx>leftCanvas && yy>topCanvas) {
                        jQuery("body",this.editorDoc).append("<div id='editorbox' style='border:1px solid black;position:absolute;'></div>");
                        this.editor.box = jQuery("#editorbox", this.editorDoc);
                        this.editor.box.css("top", this.editor.y  +"px");
                        this.editor.box.css("left",this.editor.x  +"px");
                }
        }
  },
  editorBoxCross: function(e) {

	if(!this.edited) { 
        if(!this.editor.on) {
                try {

                var st = this.editorDoc.body.scrollTop;
                var sl = this.editorDoc.body.scrollLeft;
                var xx = (e.clientX+sl);
                var yy = (e.clientY+st);

                var leftCanvas = this.canvas.getBoundingClientRect().left + sl;
                var topCanvas  = this.canvas.getBoundingClientRect().top  + st;

                if(xx>leftCanvas && yy>topCanvas) {

                        this.editor.axis_y.css("top",    yy + "px");
                        this.editor.axis_y.css("left",   leftCanvas + "px");
                        this.editor.axis_y.css("width",  this.canvas.width   + "px");
                        this.editor.axis_x.css("left",   xx + "px");
                        this.editor.axis_x.css("top",    topCanvas + "px");
                        this.editor.axis_x.css("height", this.canvas.height  + "px");

                }
                } catch(i) {
                }

        } else {

                var st = this.editorDoc.body.scrollTop;
                var sl = this.editorDoc.body.scrollLeft;
                var hh = (e.clientY+st)-this.editor.y-10;
                var ww = (e.clientX+sl)-this.editor.x-10;
                this.editor.ww = ww;
                this.editor.hh = hh;
                this.editor.box.css("height",  hh +"px");
                this.editor.box.css("width",   ww +"px");
        }
	} 
  },

  editorBoxOff: function(e) {
	
	if(!this.edited) { 

	this.edited=true; 
        this.editor.on = false;

        jQuery("#editorbox",      this.editorDoc).remove();
        jQuery("#editorboxaxisx", this.editorDoc).remove();
        jQuery("#editorboxaxisy", this.editorDoc).remove();

	var namedThis = this; 

        this.editorDoc.removeEventListener("mousedown", function (e) { namedThis.editorBoxOn(e)  } ,     false);
        this.editorDoc.removeEventListener("mouseup",   function (e) { namedThis.editorBoxOff(e) } ,     false);
        this.editorDoc.removeEventListener("mousemove", function (e) { namedThis.editorBoxCross(e)  }  , false);

        jQuery("#menu-focus",this.editorDoc).attr("disabled",false);
        jQuery("#menu-focus",this.editorDoc).html("Drag box");

        var sl = this.editorDoc.body.scrollLeft;
        var st = this.editorDoc.body.scrollTop;

        var leftCanvas = this.canvas.getBoundingClientRect().left + sl;
        var topCanvas  = this.canvas.getBoundingClientRect().top  + st;

        var xx = (e.clientX+sl);
        var yy = (e.clientY+st);
        if(xx>leftCanvas && yy>topCanvas) {
                this.editorSnap();
        }
	} 
  }, 
  editorSnap: function () {
        this.createPreviewRaw(this.referenceContentWindow , this.canvas, this.editor.x, this.editor.y, this.editor.ww, this.editor.hh);
	jQuery("body",this.editorDoc).append("<h2>Screenshot selected!</h2><p>Click Send to send this image to your history <button id='widget_snapshot_addbutton'>Send</button> or simply close this tab to give up. ");
        jQuery("#widgetscanvas",this.slideDoc).html("Click the Send button to add the image. <button id='widget_snapshot_send'>Send</button>");

        jQuery("#widget_snapshot_send",this.slideDoc).click( function () {
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
		xWid.digester.add(widgets.snapshot, widgets.snapshot.canvas.toDataURL("image/png",""));
        })

	jQuery("#widget_snapshot_addbutton",this.editorDoc).click( function () { 
                jQuery("#widgetscanvas",refThis.slideDoc).html("");
                jQuery("#widgetscanvas",refThis.slideDoc).css("display","none");
		xWid.digester.add(widgets.snapshot, widgets.snapshot.canvas.toDataURL("image/png",""));
		refThis.canvasTab.contentWindow.close();
	});

  }, 
  createPreviewRaw: function (content, canvas, x,y,dx,dy) {

    var w = content.innerWidth  + content.scrollMaxX;
    var h = content.innerHeight + content.scrollMaxY;

    var ctx = canvas.getContext("2d");

    var refWidth = 600;
    var scaleView = refWidth/w;
    var canvasStyleH = Math.round(h*scaleView);

    var sl = this.editorDoc.body.scrollLeft;
    var st = this.editorDoc.body.scrollTop;
    var canvasx = canvas.getBoundingClientRect().left + sl; //offsetLeft; 
    var canvasy = canvas.getBoundingClientRect().top  + st; //offsetTop;

    x = x-canvasx;
    y = y-canvasy;

    var ex = parseInt((w*x)/refWidth);
    var ey = parseInt((h*y)/canvasStyleH);
    var edx = parseInt((w*dx)/refWidth);
    var edy = parseInt((h*dy)/canvasStyleH);
    var canvasW = edx;
    var canvasH = edy;

    canvas.style.width  = edx+"px";
    canvas.style.height = edy+"px";

    canvas.width  = canvasW;
    canvas.height = canvasH;

    ctx.scale(1,1);
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.save();
    ctx.drawWindow(content, ex, ey, edx, edy, "rgb(255,255,255)");
    ctx.restore();
    return canvas;

  }
} 
/* Register your Widget code here... */

//widgets.list.push(widgets.snapshot); 
widgets.list[widgets.snapshot.name] = widgets.snapshot;

xWid.cssStack_slidebar.push(".statement img { width:64px; } #widgetscanvas .snapshot { padding:.5em }  ");

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
        jQuery("#widgetscanvas",this.slideDoc).html("<div class='selection'>Type text or select from browser: <br /><input id='widget_selection_field'  /><br /><button id='widget_selection_send'>Send</button></div>");
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

xWid.overlay = { 

	contentTab: null, 
	contentDoc: null, 

	rawStore    : null,
	storeIndex  : null, 

	html_overlay_helper: "<div class='overlay_menu'><button id='overlay_hide'>Show source?</button>", 

  	start: function () { 
		this.rawStore = new Array();
		var refThis = this; 
		if(this.contentTab && this.contentTab.contentDocument) { 
			this.contentDoc.location=(xWid.transport.repository);
		} 
		else { 
			this.contentTab = jetpack.tabs.open(xWid.transport.repository);
			this.contentTab.onReady(function (doc) { refThis.proxyReadyCallback(doc) }); 
		} 
		this.proxyReadyCallback = this.readyTab;
                this.contentTab.focus();

	}, 

	proxyReadyCallback: function (doc) { 

	},

	readyTab: function(doc){
			var refThis = this; 
			refThis.contentDoc = doc; 

			jQuery("body",doc).append("<div id='overlay_base'></div><div id='menu'></div><div id='historypanel'></div>");

			var cc = refThis.contentTab.contentWindow; 
			var ww = cc.innerWidth  + cc.scrollMaxX; 
			var hh = cc.innerHeight + cc.scrollMaxY; 

			if(ww<700) { 
				ww = 700;
			} 

                        jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append( " #menu { background-color:white; padding:1em;  ; height:100px; left:50px; top:40px; position:absolute; z-index:9999;   -moz-border-radius:20px; -moz-box-shadow: black 0 0 30px; border:1px solid black; background-image: -moz-linear-gradient(top, lightblue, #fff); } #historypanel { background-color:white; padding:2em; width:80%; left:50px; top:80px; position:absolute; z-index:10000;   -moz-border-radius:30px; -moz-box-shadow: black 0 0 30px; border:1px solid black; background-image: -moz-linear-gradient(top, lightblue, #fff); }  #overlay_base {position:absolute; z-index:9998; width:"+ ww +"px; height:"+ hh+"px; left:0; top:0;;   background-color:rgba(0,0,0,.7);} span.statement { width:90%; overflow:hidden; display:block; -moz-border-radius:15px;  ; padding:1em; background-image: -moz-linear-gradient(top, #fff, #dee); margin-bottom:1em; } span.datetime { background-color:#ddd; padding:.2em ; margin-right:1em; font-size:80%} ");


			refThis.showHelp(); 
			refThis.load();
	},

	showHelp: function () { 
			
		jQuery("#menu",this.contentDoc).html("");
		jQuery("#menu",this.contentDoc).css("display","block");
		jQuery("#menu",this.contentDoc).append(this.html_overlay_helper);
		var refThis = this; 
		jQuery("#overlay_hide",refThis.contentDoc).click(function () { 
			jQuery("#overlay_base",refThis.contentDoc).css("display","none");
			jQuery("#historypanel",refThis.contentDoc).css("display","none");
			jQuery("#menu",refThis.contentDoc).css("display","none");
			refThis.proxyReadyCallback = function () { }; 
		});

	},

 	load: function () { 

		refThis = this; 
		jQuery("pre", this.contentDoc).each( function () { 
			refThis.addItem(jQuery(this).html());
		});
		this.renderData();
	},

	addItem: function (lineStr) { 
		this.rawStore.push(lineStr);
	}, 

	renderData: function () { 

			this.storeIndex = new Array();

			for (var key in this.rawStore) { 
				let currLine = this.rawStore[key];
				currLine = jQuery.trim(currLine);
				var dataChunks  = currLine.split("::"); 
				var metaChunks  = dataChunks[0].split("  ");
				var stampChunks = metaChunks[0].split(" ");
				if(stampChunks.length>=2) { 
					let date = stampChunks[1]; 
					let hour = stampChunks[2]; 
					var contentData = dataChunks[1]; 
					var appData     = metaChunks[1];;
					this.addStore(date, hour, appData, contentData); 
				} else { 
				} 	
			} 
			this.sortData();
	}, 

	addStore: function ( date, hour, app, data) {

                var nodeEntry = {
                       date: date,
                       hour: hour,
                       app : app,
                       data: data
                }

		var dd = date.split("-");
		var hh = hour.split(":");
		var d1 = dd[0]+dd[1]+dd[2];
		var h1 = hh[0]+hh[1]+hh[2];
                //this.storeIndex[date+"-"+hour] = nodeEntry;
xWid.dump("["+d1+h1+"]");
                this.storeIndex["key"+d1+h1] = nodeEntry;
        },


        sortData: function () {
                jQuery("#historypanel", this.contentDoc).html("");

                var keysArray = new Array();
                for (var k in this.storeIndex ) {
                        keysArray.push(k);
                }
                keysArray.sort();

                for(var i=0;i<keysArray.length;i++) {

                        jQuery("#historypanel", this.contentDoc).append(this.render(this.storeIndex[keysArray[i]]));
                }
        },
	render: function (node) { 
		let nodeEntry = this.contentDoc.createElementNS("http://www.w3.org/1999/xhtml","span");
		nodeEntry.setAttribute("class","statement"); 
		nodeEntry.setAttribute("date",node.date); 
		nodeEntry.setAttribute("hour",node.hour); 
		nodeEntry.innerHTML="<span class='datetime'>"+node.date+" "+node.hour+"</span><span class=''>"+this.parseData(node.app,node.data)+"</span>";
		return nodeEntry;
	}, 

	parseData: function (app,data) { 
		if(app=="text/textify") {
                        return data;
                }

		return widgets.list[app].parse(data);
	}
} 
/* Put this file at the end of the build :) process */

// Enable the iframe-based wiki negotiation transport. This project was 
// designed to possibly have multiple mediators. This transport is fundamental
// component of the mediator concept. The mediator is something in the middle
// that supports Web R/W operations. 

xWid.transport = libCataliser_post; 

// Enable this to disable debugging 
xWid.dump = function () { } 

//xWid.cssStack_slidebar.push("#debug {  margin:auto; width:90%; padding:.2em; margin-top:.5em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, #555, #555); display:none;  display:block; font-size:80%; color: white; } ");

xWid.cssStack_slidebar.push(".frame { width:1px; height:1px; position:absolute; left:-10px } ");

xWid.baseURL_guidepage = "http://taboca.github.com/Expression-Widgets/guide-en-0.6.html";



