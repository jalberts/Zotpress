jQuery(document).ready(function()
{
	
    /****************************************************************************************
     *
     *     ZOTPRESS IN-TEXT
     *
     ****************************************************************************************/
	
	if ( jQuery(".zp-Zotpress-InTextBib").length > 0 )
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
					
					'item_key': params.zpItemkey,
					
					'style': params.zpStyle,
					'title': params.zpTitle,
					
					'showimage': params.zpShowImages,
					'showtags': params.zpShowTags,
					'downloadable': params.zpDownloadable,
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
						
						
						// Format in-text citations
						zp_format_intext_citations( $instance, params.zpItemkey, zp_items.data, params );
						
						
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
							
							tempItems += "<div id='zp-ID-"+jQuery(".ZP_POSTID", $instance).text()+"-"+jQuery(".ZP_API_USER_ID", $instance).text()+"-"+item.key+"' class='zp-Entry zpSearchResultsItem";
							
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
		
		jQuery(".zp-Zotpress-InTextBib").each( function( index, instance )
		{
			var $instance = jQuery(instance);
			var zp_params = new Object();
			
			zp_params.zpItemkey = false; if ( jQuery(".ZP_ITEM_KEY", $instance).text().trim().length > 0 ) zp_params.zpItemkey = jQuery(".ZP_ITEM_KEY", $instance).text();
			
			zp_params.zpStyle = false; if ( jQuery(".ZP_STYLE", $instance).text().trim().length > 0 ) zp_params.zpStyle = jQuery(".ZP_STYLE", $instance).text();
			zp_params.zpTitle = false; if ( jQuery(".ZP_TITLE", $instance).text().trim().length > 0 ) zp_params. zpTitle = jQuery(".ZP_TITLE", $instance).text();
			
			zp_params.zpShowImages = false; if ( jQuery(".ZP_SHOWIMAGE", $instance).text().trim().length > 0 ) zp_params.zpShowImages = true;
			zp_params.zpShowTags = false; if ( jQuery(".ZP_SHOWTAGS", $instance).text().trim().length > 0 ) zp_params.zpShowTags = true;
			zp_params.zpDownloadable = false; if ( jQuery(".ZP_DOWNLOADABLE", $instance).text().trim().length > 0 ) zp_params.zpDownloadable = true;
			zp_params.zpShowNotes = false; if ( jQuery(".ZP_NOTES", $instance).text().trim().length > 0 ) zp_params.zpShowNotes = true;
			zp_params.zpShowAbstracts = false; if ( jQuery(".ZP_ABSTRACT", $instance).text().trim().length > 0 ) zp_params.zpShowAbstracts = true;
			zp_params.zpCiteable = false; if ( jQuery(".ZP_CITEABLE", $instance).text().trim().length > 0 ) zp_params.zpCiteable = true;
			zp_params.zpTarget = false; if ( jQuery(".ZP_TARGET", $instance).text().trim().length > 0 ) zp_params.zpTarget = true;
			
			zp_params.zpForceNumsCount = 1;
			
			zp_get_items ( 0, 0, $instance, zp_params );
		});
		
		
		function zp_format_intext_citations ( $instance, item_keys, item_data, params )
		{
			// Possible format: NUM,{NUM,3-9};{NUM,8}
			var citation_groups = new Array();
			var post_items_count = {};
			
			// Create array for citations of item keys, if any -- semicolon
			if ( item_keys.indexOf(";") != -1 )  citation_groups = item_keys.split( ";" );
			else citation_groups.push( item_keys );
			
			jQuery.each( citation_groups, function (index, citation_group)
			{
				var tempId = citation_group.replace( /{/g, "-" ).replace( /}/g, "-" ).replace( /,/g, "_" );
				var citation_group_id = "zp-InText-zp-ID-"+jQuery(".ZP_API_USER_ID", $instance).text()+"-"+tempId+"-"+jQuery(".ZP_POSTID", $instance).text();
				var citation_group_params = JSON.parse( jQuery("#"+citation_group_id, "#post-"+jQuery(".ZP_POSTID", $instance).text() ).attr("rel").replace( /'/g, '"') );
				var citation_group_output = "";
				
				// Create array from item keys
				if ( citation_group.indexOf("{") != -1 ) // bracket
				{
					if ( citation_group.indexOf("},") != -1 ) // multiple items
					{
						citation_group = citation_group.split( "}," );
						
						// Get rid of brackets, format pages
						jQuery.each ( citation_group, function ( id, item )
						{
							// Check for pages
							if ( item.indexOf( "," ) != -1 )
							{
								item = item.split( "," );
								citation_group[id] = { "key": item[0].replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": item[1].replace( "}", "" ), "citation": "" };
							}
							else // No pages
							{
								citation_group[id] = { "key": item.replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "citation": "" };
							}
						});
					}
					else // single bracket
					{
						if ( citation_group.indexOf( "," ) != -1 ) // Pages
						{
							var item = citation_group.split( "," );
							citation_group = [{ "key": item[0].replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": item[1].replace( "}", "" ), "citation": "" }];
						}
						else // no pages
						{
							citation_group = [{ "key": citation_group.replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "citation": "" }];
						}
					}
				}
				else // no bracket, no pages
				{
					citation_group = [{ "key": citation_group, "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "citation": "" }];
				}
				// Now we have an array
				// e.g.  [{ key="3NNACKP2",  pages=false,  citation=""}, { key="S74KCIJR",  pages=false,  citation=""}]
				
				
				// Go through each item in the citation group; can be one or more items
				var group_authors = new Array();
				
				jQuery.each( citation_group, function( cindex, item )
				{
					var item_citation = "";
					var item_authors = "";
					var item_year ="";
					
					if ( ! post_items_count.hasOwnProperty(item.key) )
						post_items_count[item.key] = 1;
					else
						post_items_count[item.key]++;
					
					// Display with numbers
					if ( citation_group_params.format.indexOf("%num%") != -1 )
					{
						item_citation = Object.keys(post_items_count).indexOf( item.key) + 1;
					}
					
					// Display regularly, e.g. author and year and pages
					else
					{
						// Deal with authors and etal
						jQuery.each( item_data, function ( kindex, response_item )
						{
							if ( response_item.data.key != item.key ) return true;
							
							if ( response_item.data.hasOwnProperty("creators") )
							{
								// Deal with authors
								jQuery.each ( response_item.data.creators, function ( ai, author )
								{
									if ( ai != 0 ) item_authors += ", ";
									if ( author.hasOwnProperty("name") ) item_authors += author.name;
									else if ( author.hasOwnProperty("lastName") ) item_authors += author.lastName;
								});
								
								// Deal with duplicates in the group
								if ( group_authors.indexOf(item_authors) == -1 )
									group_authors[group_authors.length] = item_authors;
								else
									item_authors = "";
								
								// Deal with et al
								if ( citation_group_params.etal == ""
										|| citation_group_params.etal == "default" )
								{
									if ( post_items_count[item.key] > 1 )
									{
										var temp = item_authors.split(", ");
										item_authors = temp[0] + " <em>et al.</em>";
									}
								}
								else if ( citation_group_params.etal == "yes" )
								{
									var temp = item_authors.split(", ");
									item_authors = temp[0] + " <em>et al.</em>";
								}
								
								// Deal with and for multiples without etal
								if ( item_authors.indexOf(",") != -1 )
								{
									if ( citation_group_params.and == ""
											|| citation_group_params.and == "and" )
									{
										var temp = item_authors.split(", ");
										item_authors = item_authors.substring( 0, item_authors.lastIndexOf(", ") ) + ' and ' +  temp[temp.length-1];
									}
									else if ( citation_group_params.and == "comma-and" )
									{
										var temp = item_authors.split(", ");
										item_authors = item_authors.substring( 0, item_authors.lastIndexOf(", ") ) + ', and ' +  temp[temp.length-1];
									}
								}
							}
							else // Use title instead
							{
								item_authors += response_item.data.title;
							}
							
							// Get year or n.d.
							if ( response_item.meta.hasOwnProperty("parsedDate") ) 
								item_year = response_item.meta.parsedDate.substring(0, 4);
							else
								item_year = "n.d.";
							
						}); // each request data item
						
						var default_format = citation_group_params.format;
						
						// Add in author
						item_citation = citation_group_params.format.replace( "%a%" , item_authors );
						
						// Add in year
						item_citation = item_citation.replace( "%d%" , item_year );
						
						// Deal with pages
						if ( item.pages == false )
						{
							item_citation = item_citation.replace( ", %p%" , "" );
							item_citation = item_citation.replace( "%p%" , "" );
						}
						else // pages exist
						{
							item_citation = item_citation.replace( "%p%" , item.pages );
						}
						
						// If more than one item in group, remove ), (
						if ( default_format == "(%a%, %d%, %p%)" && citation_group.length > 1 )
							if ( cindex == 0 )
								item_citation = item_citation.replace( ")", "" );
							else
								if ( item_authors == "" )
									item_citation = item_citation.replace( "(, ", "" );
								else
									item_citation = item_citation.replace( "(", "" );
					}
					
					// Add anchors
					item_citation = "<a class='zp-ZotpressInText' href='#zp-ID-"+item.post_id+"-"+item.api_user_id+"-"+item.key+"'>" + item_citation + "</a>";
					
					// Add to citation_group array
					citation_group[cindex]["citation"] = item_citation;
					
				}); // each item
				
				// Format citation group
				var citation_group_pre = ""; if ( citation_group_params.brackets ) citation_group_pre = "["; // &#91;
				var citation_group_post = ""; if ( citation_group_params.brackets ) citation_group_post = "]"; // &#93;
				
				citation_group_output = citation_group_pre;
				
				jQuery.each( citation_group, function(gindex, gitem)
				{
					// Determine separator
					if ( gindex != 0 )
					{
						if ( citation_group_params.separator == "comma" )
							citation_group_output += "; ";
						else
							citation_group_output += ", ";
					}
					citation_group_output += gitem.citation;
				});
				citation_group_output += citation_group_post;
				
				// Add to placeholder
				jQuery("#"+citation_group_id).removeClass("loading").html(citation_group_output);
				
			}); // each citation_group
			
		} // zp_format_intext_citations
		
	} // Zotpress In-Text
	
	
    
    /*
     
        HIGHLIGHT ENTRY ON JUMP
        
    */
    
    jQuery(".zp-InText-Citation").on( "click", ".zp-ZotpressInText", function()
	{
		jQuery(jQuery(this).attr("href")).effect("highlight", { color: "#C5EFF7", easing: "easeInExpo" }, 1200);
	});


});