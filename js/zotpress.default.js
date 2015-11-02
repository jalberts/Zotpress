jQuery(document).ready(function() {


	/*
		
		NAVIGATION STYLES
		
	*/
	
    jQuery("div#zp-Zotpress div#zp-Zotpress-Navigation a.nav-item").click( function() {
        jQuery(this).addClass("active");
    });
	
	
	
	/*
		
		COPYING ITEM KEYS ON CLICK
		
	*/
	
	jQuery('.zp-Entry-ID-Text span').click( function() {
		jQuery(this).parent().find('input').show().select();
		jQuery(this).hide();
	});
	jQuery('.zp-Entry-ID-Text input').blur( function() {
		jQuery(this).hide();
		jQuery(this).parent().find('span').show();
	});
	
	
	
	/*
		
		FILTER CITATIONS
		
	*/
	
	// FILTER BY ACCOUNT
	
	jQuery('div#zp-Browse-Accounts').delegate("select#zp-FilterByAccount", "change", function()
	{
		var id = jQuery(this).val();
		
		jQuery(this).addClass("loading");
		jQuery("#zp-Browse-Account-Options a").addClass("disabled").unbind("click",
			function (e) {
				e.preventDefault();
				return false;
			}
		);
		
		window.location = "admin.php?page=Zotpress&api_user_id="+id;
	});
	
	
	// FILTER BY TAG
	
	jQuery('div#zp-Browse-Bar').delegate("select#zp-List-Tags", "change", function()
	{
		if ( jQuery(this).val() != "No tag selected" ) window.location = "admin.php?page=Zotpress&api_user_id="+jQuery('select#zp-FilterByAccount option:selected').val()+"&tag_id="+jQuery("option:selected", this).attr("rel");
	});
	
	
	
	/*
		
		CITATION IMAGE HOVER
		
	*/
	
	jQuery('div.zp-List').delegate("div.zp-Entry-Image", "mouseenter mouseleave", function () {
		jQuery(this).toggleClass("hover");
	});
	
	
	
	// BROWSE PAGE: SET DEFAULT ACCOUNT
	
	jQuery(".zp-Browse-Account-Import.button").click(function() { jQuery(this).addClass("loading"); });
	
	jQuery(".zp-Browse-Account-Default.button").click(function()
	{
		var $this = jQuery(this);
		
		// Plunk it together
		var data = 'submit=true&account=' + $this.attr("rel");
		
		// Prep for data validation
		$this.addClass("loading");
		
		// Set up uri
		var xmlUri = jQuery('#ZOTPRESS_PLUGIN_URL').text() + 'lib/widget/widget.metabox.actions.php?'+data;
		
		// AJAX
		jQuery.get(xmlUri, {}, function(xml)
		{
			var $result = jQuery('result', xml).attr('success');
			
			$this.removeClass("success loading");
			
			if ($result == "true")
			{
				$this.addClass("success");
				
				jQuery.doTimeout(1000,function() {
					$this.removeClass("success").addClass("selected disabled");
				});
			}
			else // Show errors
			{
				alert("Sorry, but there were errors: " + jQuery('errors', xml).text());
			}
		});
		
		// Cancel default behaviours
		return false;
		
	});
    
    
});