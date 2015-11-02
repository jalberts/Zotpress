jQuery(document).ready(function()
{
	
    /****************************************************************************************
     *
     *     ZOTPRESS BIBLIOGRAPHY
     *
     ****************************************************************************************/
	
	if ( jQuery(".zp-Zotpress-Bib").length > 0 )
	{
		// Get list items
		function zp_get_items ( request_start, request_last, $instance, params )
		{
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
					'instance_id': $instance.attr("id"),
					'api_user_id': jQuery(".ZP_API_USER_ID", $instance).text(),
					'item_type': jQuery(".ZP_DATATYPE", $instance).text(),
					
					'item_key': params.zpItemkey,
					'collection_id': params.zpCollectionId,
					'tag_id': params.zpTagId,
					
					'author': params.zpAuthor,
					'year': params.zpYear,
					'style': params.zpStyle,
					'limit': params.zpLimit,
					'title': params.zpTitle,
					
					'showimage': params.zpShowImages,
					'showtags': params.zpShowTags,
					'downloadable': params.zpDownloadable,
					'inclusive': params.zpInclusive,
					'shownotes': params.zpShowNotes,
					'showabstracts': params.zpShowAbstracts,
					'citeable': params.zpCiteable,
					
					'target': params.zpTarget,
					
					'sort_by': jQuery(".ZP_SORTBY", $instance).text(),
					'order': jQuery(".ZP_ORDER", $instance).text(),
					
					'request_start': request_start,
					'request_last': request_last,
					'zpShortcode_nonce': zpShortcodeAJAX.zpShortcode_nonce
				},
				success: function(data)
				{
					var zp_items = jQuery.parseJSON( data );
					
					// First, display the items from this request, if any
					if ( typeof zp_items != 'undefined' && zp_items != null && zp_items != 0 && zp_items.data.length > 0 )
					{
						var tempItems = "";
						if ( params.zpShowNotes == true ) var tempNotes = "";
						if ( params.zpTitle == true ) var tempTitle = "";
						
						jQuery.each(zp_items.data, function( index, item )
						{
							// Skip duplicates
							if ( jQuery("#"+zp_items.instance+" .zp-List #zp-ID-"+jQuery(".ZP_API_USER_ID", $instance).text()+"-"+item.key).length > 0 )
								return true;
							
							// Title
							if ( params.zpTitle == true )
							{
								var tempItemYear = item.meta.parsedDate.substring(0, 4);
								
								// Update title and display
								if ( tempTitle != tempItemYear )
								{
									tempTitle = tempItemYear;
									tempItems += "<h3>"+tempTitle+"</h3>\n";
								}
							}
							
							tempItems += "<div id='zp-ID-"+jQuery(".ZP_API_USER_ID", $instance).text()+"-"+item.key+"' class='zp-Entry zpSearchResultsItem";
							
							if ( jQuery("#"+zp_items.instance+" .ZP_SHOWIMAGE").text().trim().length > 0
									&& item.hasOwnProperty('image') )
							{
								tempItems += " zp-HasImage'>\n";
								tempItems += "<div id='zp-Citation-"+item.key+"' class='zp-Entry-Image hasImage' rel='"+item.key+"'>\n";
								tempItems += "<img class='thumb' src='"+item.image[0]+"' alt='image' />\n";
								tempItems += "</div><!-- .zp-Entry-Image -->\n";
							}
							else
							{
								tempItems += "'>\n";
							}
							
							// Force numbers
							if ( jQuery("#"+zp_items.instance+" .ZP_FORCENUM").text().length > 0
									&& jQuery("#"+zp_items.instance+" .ZP_FORCENUM").text() == "1" )
							{
								if ( ! /csl-left-margin/i.test(item.bib) ) // if existing style numbering not found
								{
									item.bib = item.bib.replace( '<div class="csl-entry">', '<div class="csl-entry">'+params.zpForceNumsCount+". " );
									params.zpForceNumsCount++;
								}
							}
							
							tempItems += item.bib;
							
							// Add abstracts, if any
							if ( params.zpShowAbstracts == true &&
									( item.data.hasOwnProperty('abstractNote') && item.data.abstractNote.length > 0 ) )
								tempItems +="<p class='zp-Abstract'><span class='zp-Abstract-Title'>Abstract:</span> " +item.data.abstractNote+ "</p>\n";
							
							// Add tags, if any
							if ( params.zpShowTags == true &&
									( item.data.hasOwnProperty('tags') && item.data.tags.length > 0 ) )
							{
								tempItems += "<p class='zp-Zotpress-ShowTags'><span class='title'>Tags:</span> ";
								
								jQuery.each(item.data.tags, function ( tindex, tag )
								{
									tempItems += "<span class='tag'>" + tag.tag + "</span>";
									if ( tindex != (item.data.tags.length-1) ) tempItems += "<span class='separator'>,</span> ";
								});
								tempItems += "</p>\n";
							}
							
							tempItems += "</div><!-- .zp-Entry -->\n";
							
							// Add notes, if any
							if ( params.zpShowNotes == true && item.hasOwnProperty('notes') )
								tempNotes += item.notes;
							
						}); // each item
						
						jQuery("#"+zp_items.instance+" .zp-List").removeClass("loading");
						
						// Append items to list
						jQuery("#"+zp_items.instance+" .zp-List").append( tempItems );
						
						// Append notes to container
						if ( params.zpShowNotes == true && tempNotes.length > 0 )
						{
							tempNotes = "<div class='zp-Citation-Notes'>\n<h4>Notes</h4>\n<ol>\n" + tempNotes;
							tempNotes = tempNotes + "</ol>\n</div><!-- .zp-Citation-Notes -->\n\n";
							
							jQuery("#"+zp_items.instance).append( tempNotes );
						}
						
						// Fix incorrect numbering in existing numbered style
						if ( jQuery("#"+zp_items.instance+" .zp-List .csl-left-margin").length > 0 ) 
						{
							params.zpForceNumsCount = 1;
							
							jQuery("#"+zp_items.instance+" .zp-List .csl-left-margin").each(function ( index, item )
							{
								var item_content = jQuery(item).text();
								item_content = item_content.replace( item_content.match(/\d+/)[0], params.zpForceNumsCount );
								jQuery(item).text( item_content );
								
								params.zpForceNumsCount++;
							});
						}
						
						// Then, continue with other requests, if they exist
						if ( zp_items.meta.request_next != false && zp_items.meta.request_next != "false" )
							zp_get_items ( zp_items.meta.request_next, zp_items.meta.request_last, $instance, params );
					}
					
					// Message that there's no items
					else
					{
						jQuery("#"+zp_items.instance+" .zp-List").removeClass("loading");
						jQuery("#"+zp_items.instance+" .zp-List").append("<p>There are no citations to display.</p>\n");
					}
				},
				error: function(errorThrown)
				{
					console.log(errorThrown);
				}
			});
		}
		
		jQuery(".zp-Zotpress-Bib").each( function( index, instance )
		{
			var $instance = jQuery(instance);
			var zp_params = new Object();
			
			zp_params.zpItemkey = false; if ( jQuery(".ZP_ITEM_KEY", $instance).text().trim().length > 0 ) zp_params.zpItemkey = jQuery(".ZP_ITEM_KEY", $instance).text();
			zp_params.zpCollectionId = false; if ( jQuery(".ZP_COLLECTION_ID", $instance).text().trim().length > 0 ) zp_params.zpCollectionId = jQuery(".ZP_COLLECTION_ID", $instance).text();
			zp_params.zpTagId = false; if ( jQuery(".ZP_TAG_ID", $instance).text().trim().length > 0 ) zp_params.zpTagId = jQuery(".ZP_TAG_ID", $instance).text();
			
			zp_params.zpAuthor = false; if ( jQuery(".ZP_AUTHOR", $instance).text().trim().length > 0 ) zp_params.zpAuthor = jQuery(".ZP_AUTHOR", $instance).text();
			zp_params.zpYear = false; if ( jQuery(".ZP_YEAR", $instance).text().trim().length > 0 ) zp_params.zpYear = jQuery(".ZP_YEAR", $instance).text();
			zp_params.zpStyle = false; if ( jQuery(".ZP_STYLE", $instance).text().trim().length > 0 ) zp_params.zpStyle = jQuery(".ZP_STYLE", $instance).text();
			zp_params.zpLimit = false; if ( jQuery(".ZP_LIMIT", $instance).text().trim().length > 0 ) zp_params.zpLimit = jQuery(".ZP_LIMIT", $instance).text();
			zp_params.zpTitle = false; if ( jQuery(".ZP_TITLE", $instance).text().trim().length > 0 ) zp_params. zpTitle = jQuery(".ZP_TITLE", $instance).text();
			
			zp_params.zpShowImages = false; if ( jQuery(".ZP_SHOWIMAGE", $instance).text().trim().length > 0 ) zp_params.zpShowImages = true;
			zp_params.zpShowTags = false; if ( jQuery(".ZP_SHOWTAGS", $instance).text().trim().length > 0 ) zp_params.zpShowTags = true;
			zp_params.zpDownloadable = false; if ( jQuery(".ZP_DOWNLOADABLE", $instance).text().trim().length > 0 ) zp_params.zpDownloadable = true;
			zp_params.zpInclusive = false; if ( jQuery(".ZP_INCLUSIVE", $instance).text().trim().length > 0 ) zp_params.zpInclusive = true;
			zp_params.zpShowNotes = false; if ( jQuery(".ZP_NOTES", $instance).text().trim().length > 0 ) zp_params.zpShowNotes = true;
			zp_params.zpShowAbstracts = false; if ( jQuery(".ZP_ABSTRACT", $instance).text().trim().length > 0 ) zp_params.zpShowAbstracts = true;
			zp_params.zpCiteable = false; if ( jQuery(".ZP_CITEABLE", $instance).text().trim().length > 0 ) zp_params.zpCiteable = true;
			zp_params.zpTarget = false; if ( jQuery(".ZP_TARGET", $instance).text().trim().length > 0 ) zp_params.zpTarget = true;
			
			zp_params.zpForceNumsCount = 1;
			
			// Deal with multiples
			// Order of priority: collections, tags, authors, years
			// Filters (dealt with on shortcode.ajax.php): tags?, authors, years
			if ( zp_params.zpCollectionId && zp_params.zpCollectionId.indexOf(",") != -1 )
			{
				var tempCollections = zp_params.zpCollectionId.split(",");
				
				jQuery.each( tempCollections, function (i, collection)
				{
					zp_params.zpCollectionId = collection;
					zp_get_items ( 0, 0, $instance, zp_params );
				});
			}
			else
			{
				// Inclusive tags (treat exclusive normally)
				if ( zp_params.zpTagId && zp_params.zpInclusive == true && zp_params.zpTagId.indexOf(",") != -1 )
				{
					var tempTags = zp_params.zpTagId.split(",");
					
					jQuery.each( tempTags, function (i, tag)
					{
						zp_params.zpTagId = tag;
						zp_get_items ( 0, 0, $instance, zp_params );
					});
				}
				else
				{
					if ( zp_params.zpAuthor && zp_params.zpAuthor.indexOf(",") != -1 )
					{
						var tempAuthors = zp_params.zpAuthor.split(",");
						
						if ( zp_params.zpInclusive == true )
						{
							jQuery.each( tempAuthors, function (i, author)
							{
								zp_params.zpAuthor = author;
								zp_get_items ( 0, 0, $instance, zp_params );
							});
						}
						else // exclusive
						{
							zp_get_items ( 0, 0, $instance, zp_params );
						}
					}
					else
					{
						if ( zp_params.zpYear && zp_params.zpYear.indexOf(",") != -1 )
						{
							var tempYears = zp_params.zpYear.split(",");
							
							jQuery.each( tempYears, function (i, year)
							{
								zp_params.zpYear = year;
								zp_get_items ( 0, 0, $instance, zp_params );
							});
						}
						else // NORMAL, no multiples
						{
							zp_get_items ( 0, 0, $instance, zp_params );
						}
					}
				}
			}
		});
		
	} // Zotpress Bibliography
    
});