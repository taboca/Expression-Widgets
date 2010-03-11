/* 
 * This is the first run experience that is now a project guide/wizard 
 * type of page. This needs to be synchronized with the version.
 */

/* Depends: ../vendor/jquery.js */

$(document).ready(function() {
     $('.wizard-panel').css('display','none');
     $('.wizard-button').removeClass('wizard-selected');
     var s= document.location.toString();
     var command = s.split("#show=")[1];
     if(command == undefined) { 
	command = "project";
     }
     $("#wizard-panel-"+command).css("display","block");
     $('#wizard-button-'+command).addClass('wizard-selected');
});

