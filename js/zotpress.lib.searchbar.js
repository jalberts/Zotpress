jQuery(document).ready(function()
{
    
    /****************************************************************************************
     *
     *     ZOTPRESS LIB SEARCHBAR
     *
     ****************************************************************************************/
	
	// TO-DO: notes, abstract, target, showtags
	
	if ( jQuery("#zp-Zotpress-SearchBox").length > 0 )
	{
		var zpSearchBarParams = "";
		var zpSearchBarSource = zpShortcodeAJAX.ajaxurl + "?action=zpRetrieveViaShortcode&zpShortcode_nonce="+zpShortcodeAJAX.zpShortcode_nonce;
		var zpShowImages = false; if ( jQuery("#ZOTPRESS_AC_IMAGES").length > 0 ) zpShowImages = true;
		
		function zp_set_lib_searchbar_params( filter )
		{
			// Set parameter defaults
			if ( typeof(filter) === "undefined" || filter == "false" || filter == "" )
				filter = false;
			
			zpSearchBarParams = "";
			
			// Get param basics
			zpSearchBarParams += "&api_user_id="+jQuery("#ZOTPRESS_USER").val();
			zpSearchBarParams += "&item_type=items";
			zpSearchBarParams += "&downloadable="+jQuery("#ZOTPRESS_AC_DOWNLOAD").val();
			zpSearchBarParams += "&sort_by="+jQuery("#ZP_SORTBY").text();
			zpSearchBarParams += "&order="+jQuery("#ZP_ORDER").text();
			zpSearchBarParams += "&citeable="+jQuery("#ZOTPRESS_AC_CITE").val();
			
			// Deal with possible max results
			if ( jQuery("#ZOTPRESS_AC_MAXRESULTS").val().length > 0 )
				zpSearchBarParams += "&maxresults=" + jQuery("#ZOTPRESS_AC_MAXRESULTS").val();
			
			// Deal with possible showimage
			if ( zpShowImages ) zpSearchBarParams += "&showimage=true";
			
			// Deal with possible filters
			if ( filter )
				zpSearchBarParams += "&filter="+filter;
			else if ( jQuery("input[name=zpSearchFilters]").length > 0 )
				zpSearchBarParams += "&filter="+jQuery("input[name=zpSearchFilters]:checked").val();
		}
		zp_set_lib_searchbar_params( false );
		
		
		// Deal with change in filters
		jQuery("input[name='zpSearchFilters']").click(function()
		{
			// Update filter param
			if ( jQuery("input[name=zpSearchFilters]").length > 0 )
				zp_set_lib_searchbar_params ( jQuery(this).val() );
			
			// Update autocomplete URL
			jQuery("input#zp-Zotpress-SearchBox-Input").autocomplete( "option", "source", zpSearchBarSource+zpSearchBarParams );
			
			// If there's already text, search again
			if ( jQuery("input#zp-Zotpress-SearchBox-Input").val().length > 0
					&& jQuery("input#zp-Zotpress-SearchBox-Input").val() != "Type to search" )
				jQuery("input#zp-Zotpress-SearchBox-Input").autocomplete("search");
		});
		
		
		// Set up autocomplete
		jQuery("input#zp-Zotpress-SearchBox-Input")
			.bind( "keydown", function( event )
			{
				// Don't navigate away from the input on tab when selecting an item
				if ( event.keyCode === jQuery.ui.keyCode.TAB &&
						jQuery( this ).data( "autocomplete" ).menu.active ) {
					event.preventDefault();
				}
				// Don't submit the form when pressing enter
				if ( event.keyCode === 13 ) {
					event.preventDefault();
				}
			})
			.bind( "focus", function( event )
			{
				// Remove help text on focus
				if (jQuery(this).val() == "Type to search") {
					jQuery(this).val("");
					jQuery(this).removeClass("help");
				}
			})
			.bind( "blur", function( event )
			{
				// Add help text on blur, if nothing there
				if (jQuery.trim(jQuery(this).val()) == "") {
					jQuery(this).val("Type to search");
					jQuery(this).addClass("help");
				}
			})
			.autocomplete({
				source: zpSearchBarSource+zpSearchBarParams,
				minLength: jQuery("#ZOTPRESS_AC_MINLENGTH").val(),
				focus: function() {
					// prevent value inserted on focus
					return false;
				},
				search: function( event, ui )
				{
					// Show loading icon
					jQuery(".zp-List .zpSearchLoading").addClass("show");
					
					// Empty pagination
					if ( jQuery("#zpSearchResultsPaging").length > 0 ) jQuery("#zpSearchResultsPaging").empty();
					
					// Remove old results
					jQuery("#zpSearchResultsContainer").empty();
				},
				response: function( event, ui )
				{
					// Remove loading icon
					jQuery(".zp-List .zpSearchLoading").removeClass("show");
					
					if ( ui.content != "0" )
					{
						// Display list of search results
						jQuery.each(ui.content[2], function( index, item )
						{
							var temp = "<div id='zp-Entry-"+item.key+"' class='zp-Entry zpSearchResultsItem hidden'>\n";
							
							if ( zpShowImages && item.hasOwnProperty('image') )
							{
								temp += "<div id='zp-Citation-"+item.key+"' class='zp-Entry-Image hasImage' rel='"+item.key+"'>\n";
								temp += "<img class='thumb' src='"+item.image[0]+"' alt='image' />\n";
								temp += "</div><!-- .zp-Entry-Image -->\n";
							}
							temp += item.bib;
							
							if ( jQuery("input#tag[name=zpSearchFilters]:checked").length > 0 )
							{
								temp += "<span class='item_key'>Tag(s): ";
								
								jQuery.each( item.data.tags, function ( tindex, tagval )
								{
									if ( tindex != 0 ) temp += ", ";
									temp += tagval.tag;
								});
							}
							
							jQuery("#zpSearchResultsContainer").append(temp+"</div><!-- .zp-Entry -->\n");
						});
						
						// Update pagination
						window.zpACPagination(true);
					}
					else
					{
						if ( jQuery("#zpSearchResultsPaging").length > 0 ) jQuery("#zpSearchResultsPaging").empty();
						jQuery("#zpSearchResultsContainer").append("<p>No items found.</p>\n");
					}
				},
				open: function ()
				{
					// Don't show the dropdown
					jQuery(".ui-autocomplete").hide();
				}
			});
		
	} // Zotpress SearchBar Library
	
});