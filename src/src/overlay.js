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
