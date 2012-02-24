/* mainPage.js */
$(document).ready(function(){
    
    var siteURL = window.location.href;

	//alert('Beer On Demand - Main Page');

	// Chart left nav button functionality.
	$('.buttonLeftOff').hover(function() {
		$(this).removeClass('buttonLeftOff').addClass('buttonLeftOn');
	});
	
	$('.buttonLeftOff').mouseout(function() {								   
		$(this).removeClass('buttonLeftOn').addClass('buttonLeftOff');
	});	
	
	$('.buttonLeftOff').click(function() {															
		// Go to previous chart.
	});
	
	// Chart right nav button functionality.
	$('.buttonRightOff').hover(function() {								   	
		$(this).toggleClass('buttonRightOn');
	});	
	
	$('.buttonRightOff').click(function() {															
		// Go to next chart.
	});
		
	$(function(){   
	  makeScrollable("div.sc_menu_wrapper", "div.sc_menu");
	});
});	