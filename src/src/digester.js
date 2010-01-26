
/* 
 Digester 
 ---
*/

xWid.digester = { 
	
	slideDoc        : null, 
        userContent     : null,  /* content from the wiki */
        cycle 		: null,  // state machine r/w modes etc

        
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


		var preParse = this.userContent.split("=== "+xWid.transport.login+ " ===");
		if (preParse.length==2) { 
			xWid.dump("Found user..");
			
			var userData = preParse[1].split("*"); 

			for (var key in userData) { 
				let currLine = userData[key];

				// We trim first
				currLine = jQuery.trim(currLine);
	
				let dataChunks = currLine.split("  "); 
				let metaChunks = dataChunks[0];
			
				if(metaChunks.length>=2) { 

					let date = metaChunks[0]; 
					let hour = metaChunks[1]; 
				 	let data = dataChunks[1]; 	

					var richNode=""; 
 					try { 
						xWid.dump("==="+data);
						richNode = this.parseData(data);
					} catch(i) { richNode = "" } 
//					richNode = data; 

	
					let nodeEntry = this.slideDoc.createElementNS("http://www.w3.org/1999/xhtml","span");
					nodeEntry.setAttribute("class","statement"); 
					nodeEntry.setAttribute("date",date); 
					nodeEntry.setAttribute("hour",hour); 
					nodeEntry.innerHTML=richNode;
					jQuery("#historypanel", this.slideDoc).append(nodeEntry);	
				
				} else { 
					xWid.dump("Not understand statement..");
				} 	

			} 
		} 
	}, 

	/* So far we have the various types here hardcoded. But these visualization/parsing needs 
	to be defined in the widget time. */
	parseData: function (data) { 
		var queryAppData = data.split("::");
		var appName = queryAppData[0];
		return widgets.list[appName].parse(queryAppData[1]);
	},	

	refreshSelfTextArea: function () { 
	 //	jQuery("#wikitextarea",this.slideDoc).val(this.userContent);
	} , 

  	parse: function () { 

	} , 

	add: function ( refWidget, data) { 
		var yy = this.time_getYear(); 
		var mo = this.time_getMonth(); 
		var dd = this.time_getDay(); 
		var hh = this.time_getHour(); 
		var mm = this.time_getMin(); 
		var ss = this.time_getSec(); 
		/* We now have to send the time stamp using some form of universal date time 
		pattern that can be sortable as we may want to later on sort all the participants
		data by the time they posted */
		var sortableDateTimeStamp = yy+"-"+mo+"-"+dd+" "+hh+":"+mm+":"+ss+" ";	
		this.userContent = this.userContent + "\n * "+ sortableDateTimeStamp +" "+refWidget.name+"::"+data + "\n" ;
		//jQuery("#wikitextarea", this.slideDoc).val( this.userContent );

	} 
} 

