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

