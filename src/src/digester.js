
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

					this.addStore(date, hour, appData, contentData); 

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
                for(var i=0;i<keysArray.length;i++) {

                        jQuery("#historypanel", this.slideDoc).append(this.render(this.storeIndex[keysArray[i]]));
                }
        },
	render: function (node) { 
		let nodeEntry = this.slideDoc.createElementNS("http://www.w3.org/1999/xhtml","span");
		nodeEntry.setAttribute("class","statement"); 
		nodeEntry.setAttribute("date",node.date); 
		nodeEntry.setAttribute("hour",node.hour); 
		nodeEntry.innerHTML=this.parseData(node.app,node.data);
		return nodeEntry;
	}, 

	/* So far we have the various types here hardcoded. But these visualization/parsing needs 
	to be defined in the widget time. */
	parseData: function (app,data) { 
		return widgets.list[app].parse(data);
	},	

        addStore: function ( date, hour, app, data) {
                var nodeEntry = {
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

                this.addStore(date, hour, refWidget.name, data);
//              var sortableDateTimeStamp = yy+"-"+mo+"-"+dd+" "+hh+":"+mm+":"+ss+" ";  
//              this.userContent = this.userContent + "\n * "+ sortableDateTimeStamp +" "+refWidget.name+"::"+data + "\n" ;
                //jQuery("#wikitextarea", this.slideDoc).val( this.userContent );
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

