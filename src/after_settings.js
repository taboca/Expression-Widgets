/* Put this file at the end of the build :) process */

// Enable the iframe-based wiki negotiation transport. This project was 
// designed to possibly have multiple mediators. This transport is fundamental
// component of the mediator concept. The mediator is something in the middle
// that supports Web R/W operations. 

xWid.transport = libCataliser_post; 

// Enable this to disable debugging 
//xWid.dump = function () { } 

xWid.cssStack_slidebar.push("#debug {  margin:auto; width:90%; padding:.2em; margin-top:.5em; -moz-box-shadow: black 0 0 10px; -moz-border-radius:10px; width:94%; background-image: -moz-linear-gradient(top, #555, #555); display:none;  display:block; font-size:80%; color: white; } ");

xWid.cssStack_slidebar.push(".frame { width:1px; height:1px; position:absolute; left:-10px } ");

xWid.baseURL_guidepage = "http://taboca.github.com/Expression-Widgets/guide-en-0.6.html";



