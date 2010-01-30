xWid.overlay = { 

	contentTab: null, 
	contentDoc: null, 

	rawStore    : null,
	storeIndex  : null, 

	html_overlay_helper: "<div class='overlay_menu'><button id='overlay_hide'>Hide Overlay</button>", 

  	start: function () { 
		this.rawStore = new Array();
		this.contentTab = jetpack.tabs.open(xWid.transport.repository);
                this.contentTab.focus();
		var refThis = this; 
		this.contentTab.onReady(function(doc){
			refThis.contentDoc = doc; 
			jQuery("body",doc).append("<div id='overlay_base'></div><div id='historypanel'></div>");

			var cc = refThis.contentTab.contentWindow; 
			var ww = cc.innerWidth + cc.scrollMaxX; 
			var hh = cc.innerHeight + cc.scrollMaxY; 

			if(ww<700) { 
				ww = 700;
			} 

                        jQuery(doc.createElementNS("http://www.w3.org/1999/xhtml", "style")).appendTo(jQuery("head",doc)).append( "#historypanel { background-color:white; padding:2em; width:80%; left:50px; top:80px; position:absolute; z-index:10000;   -moz-border-radius:30px; -moz-box-shadow: white 0 0 30px; border:10px solid white; }  #overlay_base {position:absolute; z-index:9999; width:"+ ww +"px; height:"+ hh+"px; left:0; top:0;;   background-color:rgba(0,0,0,.8);} span.statement { width:90%; overflow:hidden; display:block; border:1px solid black; padding:1em; margin-bottom:1em; } ");



			refThis.showHelp(); 
			refThis.load();
		});
	}, 

	showHelp: function () { 

		jQuery("#notificationpanel",xWid.uiDoc).css("display","block");
		jQuery("#notificationpanel",xWid.uiDoc).append(this.html_overlay_helper);
		var refThis = this; 
		jQuery("#overlay_hide",xWid.uiDoc).click(function () { 
			jQuery("#overlay_base",refThis.contentDoc).css("display","none");
			jQuery("#historypanel",refThis.contentDoc).css("display","none");
		});

	},

 	load: function () { 

		refThis = this; 
		jQuery("pre", this.contentDoc).each( function () { 
			refThis.addItem(jQuery(this).text());
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
                this.storeIndex[date+hour +"-"+Math.random()] = nodeEntry;
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
		nodeEntry.innerHTML=this.parseData(node.app,node.data);
		return nodeEntry;
	}, 

	parseData: function (app,data) { 
		return widgets.list[app].parse(data);
	}
} 
