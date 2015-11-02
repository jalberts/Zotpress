jQuery(document).ready(function()
{
	
    /****************************************************************************************
     *
     *     ZOTPRESS LIB DROPDOWN
     *
     ****************************************************************************************/
	
	// TO-DO: notes, abstract, target, showtags
	
	var zpCollectionId = false; if ( jQuery("#ZP_COLLECTION_ID").length > 0 ) zpCollectionId = jQuery("#ZP_COLLECTION_ID").text();
	var zpTagId = false; if ( jQuery("#ZP_TAG_ID").length > 0 ) zpTagId = jQuery("#ZP_TAG_ID").text();
	var zpShowImages = false; if ( jQuery("#ZP_SHOWIMAGE").length > 0 &&  ( jQuery("#ZP_SHOWIMAGE").text() == "yes" || jQuery("#ZP_SHOWIMAGE").text() == "true" ||  jQuery("#ZP_SHOWIMAGE").text() == "1" ) ) zpShowImages = true;
	var zpIsAdmin = false; if ( jQuery("#ZP_ISADMIN").length > 0 ) zpIsAdmin = true;
    
	if ( jQuery("#zp-Browse-Collections-Select").length > 0 )
	{
		// Get list of collections
		function zp_get_collections ( request_start, request_last )
		{
			// Set parameter defaults
			if ( typeof(request_start) === "undefined" || request_start == "false" || request_start == "" )
				request_start = 0;
			
			if ( typeof(request_last) === "undefined" || request_last == "false" || request_last == "" )
				request_last = 0;
			
			jQuery.ajax(
			{
				url: zpShortcodeAJAX.ajaxurl,
				ifModified: true,
				data: {
					'action': 'zpRetrieveViaShortcode',
					'api_user_id': jQuery("#ZP_API_USER_ID").text(),
					'item_type': 'collections',
					'collection_id': zpCollectionId,
					'request_start': request_start,
					'request_last': request_last,
					'sort_by': "title",
					'get_top': true,
					'zpShortcode_nonce': zpShortcodeAJAX.zpShortcode_nonce
				},
				success: function(data)
				{
					var zp_collections = jQuery.parseJSON( data );
					var zp_collection_options = "";
					
					if ( zpCollectionId && jQuery("#zp-Browse-Collections-Select option.toplevel").length == 0 )
					{
						jQuery("select#zp-Browse-Collections-Select").append( "<option value='blank' class='blank'>"+jQuery("#ZP_COLLECTION_NAME").text()+"</option>\n" );
					}
					
					if ( zp_collections != "0" && zp_collections.data.length > 0 )
					{
						jQuery.each(zp_collections.data, function( index, collection )
						{
							var temp = "<option value='"+collection.key+"'";
							if ( zpCollectionId == collection.key ) temp += " selected='selected'";
							temp += ">";
							if ( zpCollectionId ) temp += "- "; // For subcollection dropdown indent
							temp += collection.data.name+" (";
							if ( collection.meta.numCollections > 0 ) temp += collection.meta.numCollections+" subcollections, ";
							temp += collection.meta.numItems+" items)</option>\n";
							
							zp_collection_options += temp;
						});
						jQuery("select#zp-Browse-Collections-Select").append( zp_collection_options );
						
						// Then, continue with other requests, if they exist
						if ( zp_collections.meta.request_next != false && zp_collections.meta.request_next != "false" )
							zp_get_collections ( zp_collections.meta.request_next, zp_collections.meta.request_last );
					}
					
					if ( zpCollectionId && jQuery("#zp-Browse-Collections-Select option.toplevel").length == 0 )
					{
						jQuery("select#zp-Browse-Collections-Select").append( "<option value='toplevel' class='toplevel'>Back to top level</option>\n" );
					}
					
					// Remove loading indicator
					jQuery("select#zp-Browse-Collections-Select").removeClass("loading").find(".loading").remove();
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
			});
		}
		zp_get_collections ( 0, 0 );
		
		
		
		// Get list of tags
		function zp_get_tags ( request_start, request_last )
		{
			// Set parameter defaults
			if ( typeof(request_start) === "undefined" || request_start == "false" || request_start == "" )
				request_start = 0;
			
			if ( typeof(request_last) === "undefined" || request_last == "false" || request_last == "" )
				request_last = 0;
			
			jQuery.ajax(
			{
				url: zpShortcodeAJAX.ajaxurl,
				ifModified: true,
				data: {
					'action': 'zpRetrieveViaShortcode',
					'api_user_id': jQuery("#ZP_API_USER_ID").text(),
					'item_type': 'tags',
					'maxtags': jQuery("#ZP_MAXTAGS").text(),
					'request_start': request_start,
					'request_last': request_last,
					'zpShortcode_nonce': zpShortcodeAJAX.zpShortcode_nonce
				},
				success: function(data)
				{
					var zp_tags = jQuery.parseJSON( data );
					var zp_tag_options = "<option id='zp-List-Tags-Select' name='zp-List-Tags-Select'>No tag selected</option>\n";
					
					if ( zp_tags.data.length > 0 )
					{
						jQuery.each(zp_tags.data, function( index, tag )
						{
							var temp = "<option class='zp-List-Tag' value='"+tag.tag.replace(/ /g, "+")+"'";
							
							if ( jQuery("#ZP_TAG_ID").length > 0
									&& jQuery("#ZP_TAG_ID").text() == tag.tag )
							{
								temp += " selected='selected'";
							}
							temp += ">"+tag.tag+" ("+tag.meta.numItems+" items)</option>\n";
							
							zp_tag_options += temp;
						});
						jQuery("select#zp-List-Tags").append( zp_tag_options );
							
						// Then, continue with other requests, if they exist
						if ( zp_tags.meta.request_next != false && zp_tags.meta.request_next != "false" )
							zp_get_tags ( zp_tags.meta.request_next, zp_tags.meta.request_last );
					}
					
					// Remove loading indicator
					jQuery("select#zp-List-Tags").removeClass("loading").find(".loading").remove();
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
			});
		}
		zp_get_tags ( 0, 0 );
		
		
		
		var zpItemsFlag = true;
		
		// Get list items
		function zp_get_items ( request_start, request_last )
		{
			// Set parameter defaults
			if ( typeof(request_start) === "undefined" || request_start == "false" || request_start == "" )
				request_start = 0;
			
			if ( typeof(request_last) === "undefined" || request_last == "false" || request_last == "" )
				request_last = 0;
			
			jQuery.ajax(
			{
				url: zpShortcodeAJAX.ajaxurl,
				ifModified: true,
				data: {
					'action': 'zpRetrieveViaShortcode',
					'api_user_id': jQuery("#ZP_API_USER_ID").text(),
					'citeable': jQuery("#ZP_CITEABLE").text(),
					'downloadable': jQuery("#ZP_DOWNLOADABLE").text(),
					'is_dropdown': true,
					'showimage': jQuery("#ZP_SHOWIMAGE").text(),
					'item_type': 'items',
					'collection_id': zpCollectionId,
					'tag_id': zpTagId,
					'get_top': true,
					'sort_by': jQuery("#ZP_SORTBY").text(),
					'order': jQuery("#ZP_ORDER").text(),
					'request_start': request_start,
					'request_last': request_last,
					'zpShortcode_nonce': zpShortcodeAJAX.zpShortcode_nonce
				},
				success: function(data)
				{
					var zp_items = jQuery.parseJSON( data );
					
					jQuery(".zp-List").removeClass("loading");
					
					// First, display the items from this request, if any
					if ( typeof zp_items != 'undefined' && zp_items != null && zp_items != 0 && zp_items.data.length > 0 )
					{
						var tempItems = "";
						
						jQuery.each(zp_items.data, function( index, item )
						{
							tempItems += "<div id='zp-Entry-"+item.key+"' class='zp-Entry zpSearchResultsItem hidden'>\n";
							
							if ( zpIsAdmin || ( zpShowImages && item.hasOwnProperty('image') ) )
							{
								tempItems += "<div id='zp-Citation-"+item.key+"' class='zp-Entry-Image";
								if ( item.hasOwnProperty('image') ) tempItems += " hasImage";
								tempItems += "' rel='"+item.key+"'>\n";
								
								if ( zpIsAdmin ) tempItems += "<a title='Set Image' class='upload' rel='"+item.key+"' href='#'>Set Image</a>\n";
								if ( zpIsAdmin && item.hasOwnProperty('image') ) tempItems += "<a title='Remove Image' class='delete' rel='"+item.key+"' href='#'>&times;</a>\n";
								if ( item.hasOwnProperty('image') ) tempItems += "<img class='thumb' src='"+item.image[0]+"' alt='image' />\n";
								
								tempItems += "</div><!-- .zp-Entry-Image -->\n";
							}
							
							tempItems += item.bib;
							tempItems += "</div><!-- .zp-Entry -->\n";
						});
						
						jQuery("#zpSearchResultsContainer").append( tempItems );
						
						// Then, continue with other requests, if they exist
						if ( zp_items.meta.request_next != false && zp_items.meta.request_next != "false" )
						{
							if ( zpItemsFlag == true ) window.zpACPagination(zpItemsFlag, false); 
							else window.zpACPagination(zpItemsFlag, true); 
							zpItemsFlag = false;
							
							zp_get_items ( zp_items.meta.request_next, zp_items.meta.request_last );
						}
						else
						{
							window.zpACPagination(zpItemsFlag); 
							zpItemsFlag = false;
						}
					}
					
					// Message that there's no items
					else
					{
						jQuery("#zpSearchResultsContainer").append("<p>There are no citations to display.</p>\n");
					}
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
			});
		}
		
		zp_get_items ( 0, 0 );
		
	} // Zotpress DropDown Library
    
});