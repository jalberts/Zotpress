jQuery(document).ready( function()
{
    
    
    /*
     
        SETUP BUTTONS
        
    */

    jQuery("input#zp-Zotpress-Setup-Options-Complete").click(function()
    {
        //if ( jQuery(this).hasClass("import") )
        //    window.parent.location = "admin.php?page=Zotpress";
        //else
            window.parent.location = "admin.php?page=Zotpress&accounts=true";
        return false;
    });
    
    
    
    /*
        
        SYNC ACCOUNT WITH ZOTPRESS
        
    */

    jQuery('#zp-Connect').click(function ()
    {
        // Disable all the text fields
        jQuery('input[name!=update], textarea, select').attr('disabled','true');
        
        // Show the loading sign
        jQuery('.zp-Errors').hide();
        jQuery('.zp-Success').hide();
        jQuery('.zp-Loading').show();
        
		jQuery.ajax(
		{
			url: zpAccountsAJAX.ajaxurl,
			data: {
				'action': 'zpAccountsViaAJAX',
				'action_type': 'add_account',
				'account_type': jQuery('select[name=account_type] option:selected').val(),
				'api_user_id': jQuery('input[name=api_user_id]').val(),
				'public_key': jQuery('input[name=public_key]').val(),
				'nickname': escape(jQuery('input[name=nickname]').val()),
				'zpAccountsAJAX_nonce': zpAccountsAJAX.zpAccountsAJAX_nonce
			},
			xhrFields: {
				withCredentials: true
			},
			success: function(xml)
			{
				var $result = jQuery('result', xml).attr('success');
				
				if ($result == "true")
				{
					jQuery('div.zp-Errors').hide();
					jQuery('.zp-Loading').hide();
					jQuery('div.zp-Success').html("<p><strong>Success!</strong> Your Zotero account has been validated.</p>\n");
					
					jQuery('div.zp-Success').show();
					
					// SETUP
					if (jQuery("div#zp-Setup").length > 0)
					{
						jQuery.doTimeout(1000,function() {
							window.parent.location = "admin.php?page=Zotpress&setup=true&setupstep=two";
						});
					}
					
					// REGULAR
					else 
					{
						jQuery.doTimeout(1000,function()
						{
							jQuery('div#zp-AddAccount').slideUp("fast");
							jQuery('form#zp-Add')[0].reset();
							jQuery('input[name!=update], textarea, select').removeAttr('disabled');
							jQuery('div.zp-Success').hide();
							
							DisplayAccounts();
						});
					}
				}
				else // Show errors
				{
					jQuery('input, textarea, select').removeAttr('disabled');
					jQuery('div.zp-Errors').html("<p><strong>Oops!</strong> "+jQuery('errors', xml).text()+"</p>\n");
					jQuery('div.zp-Errors').show();
					jQuery('.zp-Loading').hide();
				}
			},
			error: function(errorThrown)
			{
				console.log(errorThrown);
			}
		});
        
        return false;
    });
    
    
    
    /*
     
        OAUTH MODAL
        
    */
    
    //jQuery('a.zp-OAuth-Button').livequery('click', function() { 
    //    tb_show('', jQuery(this).attr('href')+'&TB_iframe=true');
    //    return false;
    //});

    

    /*
        
        REMOVE ACCOUNT
        
    */

    jQuery('#zp-Accounts').delegate(".actions a.delete", "click", function ()
	{
        $this = jQuery(this);
        $thisProject = $this.parent().parent();
        
        var confirmDelete = confirm("Are you sure you want to remove this account?");
        
        if (confirmDelete==true)
        {
			jQuery.ajax(
			{
				url: zpAccountsAJAX.ajaxurl,
				data: {
					'action': 'zpAccountsViaAJAX',
					'action_type': 'delete_account',
					'api_user_id': $this.attr("href").replace("#", ""),
					'zpAccountsAJAX_nonce': zpAccountsAJAX.zpAccountsAJAX_nonce
				},
				xhrFields: {
					withCredentials: true
				},
				success: function(xml)
				{
					if ( jQuery('result', xml).attr('success') == "true" )
					{
						if ( jQuery('result', xml).attr('total_accounts') == 0 )
							window.location = 'admin.php?page=Zotpress';
						else
							window.location = 'admin.php?page=Zotpress&accounts=true';
					}
					else
					{
						alert( "Sorry - couldn't delete that account." );
					}
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
            });
        }
        
        return false;
    });
	
	
	
    /*
        
        CLEAR ACCOUNT CACHE
        
    */

    jQuery('#zp-Accounts').delegate(".actions a.cache", "click", function ()
	{
        $this = jQuery(this);
        $thisProject = $this.parent().parent();
        
        var confirmClearCache = confirm("Are you sure you want to clear the cache for this account?");
        
        if (confirmClearCache==true)
        {
			jQuery.ajax(
			{
				url: zpAccountsAJAX.ajaxurl,
				data: {
					'action': 'zpAccountsViaAJAX',
					'action_type': 'clear_cache',
					'api_user_id': $this.attr("href").replace("#", ""),
					'zpAccountsAJAX_nonce': zpAccountsAJAX.zpAccountsAJAX_nonce
				},
				xhrFields: {
					withCredentials: true
				},
				success: function(xml)
				{
					if ( jQuery('result', xml).attr('success') == "true" )
					{
						alert( "Cache cleared!" );
					}
					else
					{
						alert( "Sorry - couldn't clear the cache for that account." );
					}
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
            });
        }
        
        return false;
    });
    
	
	
    /*
        
        SET ACCOUNT TO DEFAULT
        
    */
	
	jQuery(".zp-Accounts-Default").click(function()
	{
		var $this = jQuery(this);
		
		// Prep for data validation
		$this.addClass("loading");
		
		// AJAX
		jQuery.ajax(
		{
			url: zpAccountsAJAX.ajaxurl,
			data: {
				'action': 'zpAccountsViaAJAX',
				'action_type': 'default_account',
				'api_user_id': $this.attr("rel"),
				'zpAccountsAJAX_nonce': zpAccountsAJAX.zpAccountsAJAX_nonce
			},
			xhrFields: {
				withCredentials: true
			},
			success: function(xml)
			{
				var $result = jQuery('result', xml).attr('success');
				
				$this.removeClass("success loading");
				
				if ($result == "true")
				{
					$this.addClass("success");
					jQuery(".zp-Accounts-Default").parent().removeClass("selected");
					
					jQuery.doTimeout(1000,function() {
						$this.removeClass("success");
						$this.parent().addClass("selected");
					});
				}
				else // Show errors
				{
					alert(jQuery('errors', xml).text());
				}
			},
			error: function(errorThrown)
			{
				console.log(errorThrown);
			}
		});
		
		// Cancel default behaviours
		return false;
		
	});
	
	
	
    /*
        
        ADD/UPDATE ITEM IMAGE
        
    */
	
	var zp_uploader;
	
	jQuery(".zp-List").on("click", ".zp-Entry-Image a.upload", function(e)
	{
        e.preventDefault();
		
		$this = jQuery(this);
		
        if (zp_uploader)
		{
            zp_uploader.open();
            return;
        }
		
        zp_uploader = wp.media.frames.file_frame = wp.media(
		{
			title: 'Choose Image',
			button: {
				text: 'Choose Image'
			},
			multiple: false
		});
		
        zp_uploader.on( 'select', function()
		{
            attachment = zp_uploader.state().get('selection').first().toJSON();
			
			// Save as featured image
			jQuery.ajax(
			{
				url: zpAccountsAJAX.ajaxurl,
				data: {
					'action': 'zpAccountsViaAJAX',
					'action_type': 'add_image',
					'api_user_id': jQuery("#ZP_API_USER_ID").text(),
					'item_key': $this.attr('rel'),
					'image_id': attachment.id,
					'zpAccountsAJAX_nonce': zpAccountsAJAX.zpAccountsAJAX_nonce
				},
				success: function(xml)
				{
					var $result = jQuery('result', xml).attr('success');
					
					if ( $result == "true" )
					{
						if ( $this.parent().find(".thumb").length > 0 ) {
							$this.parent().find(".thumb").attr("src", attachment.url);
						}
						else {
							$this.parent().addClass("hasImage");
							$this.parent().prepend("<img class='thumb' src='"+attachment.url+"' alt='image' />");
						}
					}
					else // Show errors
					{
						alert ("Sorry, featured image couldn't be set.");
					}
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
			});
        });
		
        zp_uploader.open();
		
    });
	
	
	
    /*
        
        REMOVE ITEM IMAGE
        
    */
	
	jQuery(".zp-List").on("click", ".zp-Entry-Image a.delete", function(e)
	{
        e.preventDefault();
		
		$this = jQuery(this);
		
		jQuery.ajax(
		{
			url: zpAccountsAJAX.ajaxurl,
			data: {
				'action': 'zpAccountsViaAJAX',
				'action_type': 'remove_image',
				'api_user_id': jQuery("#ZP_API_USER_ID").text(),
				'item_key': $this.attr('rel'),
				'zpAccountsAJAX_nonce': zpAccountsAJAX.zpAccountsAJAX_nonce
			},
			xhrFields: {
				withCredentials: true
			},
			success: function(xml)
			{
				var $result = jQuery('result', xml).attr('success');
				
				if ( $result == "true" )
				{
					$this.parent().removeClass("hasImage");
					$this.parent().find(".thumb").remove();
				}
				else // Show errors
				{
					alert ("Sorry, featured image couldn't be set.");
				}
			},
			error: function(errorThrown)
			{
				console.log(errorThrown);
			}
		});
	});
	
	
	
    /*
        
        HELP PAGE
        
    */
	
	if ( jQuery("#zp-Zotero-API").length > 0 ) jQuery("#zp-Zotero-API").tabs();


});