jQuery(document).ready(function()
{
	
    /****************************************************************************************
     *
     *     ZOTPRESS IN-TEXT
     *
     ****************************************************************************************/
	
	if ( jQuery(".zp-Zotpress-InTextBib").length > 0 )
	{
		// Create global array for citations per post
		window.zpIntextCitations = {};
		
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
						
						
						// Format in-text bibliography
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
			window.zpIntextCitations["post-"+jQuery(".ZP_POSTID", $instance).text()] = {};
			
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
			// Possible format: NUM,{NUM,3-9};{NUM,8}, including repeats
			var intext_citations = new Array();
			
			// Create array for multiple in-text citations -- semicolon
			if ( item_keys.indexOf(";") != -1 )  intext_citations = item_keys.split( ";" );
			else intext_citations.push( item_keys );
			
			jQuery.each( intext_citations, function (index, intext_citation)
			{
				var postRef = "";
				if ( jQuery("#post-"+jQuery(".ZP_POSTID", $instance).text()).length > 0 )
					postRef = "#post-"+jQuery(".ZP_POSTID", $instance).text();
				else // assume class
					postRef = ".post-"+jQuery(".ZP_POSTID", $instance).text();
				
				var tempId = intext_citation.replace( /{/g, "-" ).replace( /}/g, "-" ).replace( /,/g, "_" );
				var intext_citation_id = "zp-InText-zp-ID-"+jQuery(".ZP_API_USER_ID", $instance).text()+"-"+tempId+"-"+jQuery(".ZP_POSTID", $instance).text()+"-"+(index+1);
				var intext_citation_params = JSON.parse( jQuery("#"+intext_citation_id, postRef ).attr("rel").replace( /'/g, '"') );
				var intext_citation_output = "";
				
				// Create array from item keys
				if ( intext_citation.indexOf("{") != -1 ) // bracket
				{
					if ( intext_citation.indexOf("},") != -1 ) // multiple items
					{
						intext_citation = intext_citation.split( "}," );
						
						// Get rid of brackets, format pages
						jQuery.each ( intext_citation, function ( id, item )
						{
							// Check for pages
							if ( item.indexOf( "," ) != -1 )
							{
								item = item.split( "," );
								intext_citation[id] = { "key": item[0].replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": item[1].replace( "}", "" ), "bib": "", "citation_ids": "" };
							}
							else // No pages
							{
								intext_citation[id] = { "key": item.replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "bib": "", "citation_ids": "" };
							}
						});
					}
					else // single bracket
					{
						if ( intext_citation.indexOf( "," ) != -1 ) // Pages
						{
							var item = intext_citation.split( "," );
							intext_citation = [{ "key": item[0].replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": item[1].replace( "}", "" ), "bib": "", "citation_ids": "" }];
						}
						else // no pages
						{
							intext_citation = [{ "key": intext_citation.replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "bib": "", "citation_ids": "" }];
						}
					}
				}
				else // no bracket, no pages
				{
					intext_citation = [{ "key": intext_citation, "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "bib": "", "citation_ids": "" }];
				}
				// Now we have an array
				// e.g.  [{ key="3NNACKP2",  pages=false,  citation=""}, { key="S74KCIJR",  pages=false,  citation=""}]
				
				
				// Go through each item in the citation; can be one or more items
				var group_authors = new Array();
				
				jQuery.each( intext_citation, function( cindex, item )
				{
					var item_citation = "";
					var item_authors = "";
					var item_year ="";
					
					// Add to global array, if not already there
					if ( ! window.zpIntextCitations["post-"+item.post_id].hasOwnProperty(item.key) )
						window.zpIntextCitations["post-"+item.post_id][item.key] = item;
					else
						window.zpIntextCitations["post-"+item.post_id][item.key]["citation_ids"] += intext_citation_id + " ";
					
					// Display with numbers
					if ( intext_citation_params.format.indexOf("%num%") != -1 )
					{
						item_citation = Object.keys(window.zpIntextCitations["post-"+item.post_id]).indexOf( item.key) + 1;
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
								
								// Create authors array (easier to deal with)
								item_authors = item_authors.split(", ");
								
								// Deal with et al for more than two authors
								if ( item_authors.length > 2 )
								{
									if ( intext_citation_params.etal == ""
											|| intext_citation_params.etal == "default" )
									{
										if ( window.zpIntextCitations["post-"+item.post_id][item.key]["citation_ids"].length > 1 ) 
											item_authors = item_authors[0] + " <em>et al.</em>";
									}
									else if ( intext_citation_params.etal == "yes" )
									{
										item_authors = item_authors[0] + " <em>et al.</em>";
									}
								}
								
								// Deal with "and" for multiples that are not using "etal"
								if ( jQuery.isArray(item_authors) && item_authors.length > 1 )
								{
									if ( item_authors.indexOf("et al") == -1 )
									{
										var temp_and = ", ";
										
										if ( intext_citation_params.and == ""
												|| intext_citation_params.and == "and"
												|| intext_citation_params.and == "comma-and" )
										{
											if ( intext_citation_params.and == "" ) temp_and = " and ";
											else if ( intext_citation_params.and == "and" ) temp_and = " and ";
											else if ( intext_citation_params.and == "comma-and" ) temp_and = ", and ";
											
											var temp = item_authors.join().replace( /,/g, ", " );
											item_authors = temp.substring( 0, temp.lastIndexOf(", ") ) + temp_and +  item_authors[item_authors.length-1];
										}
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
						
						
						
						var default_format = intext_citation_params.format;
						
						// Add in author
						item_citation = intext_citation_params.format.replace( "%a%" , item_authors );
						
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
						if ( default_format == "(%a%, %d%, %p%)" && intext_citation.length > 1 )
						{
							if ( cindex != intext_citation.length - 1 )
								item_citation = item_citation.replace( ")", "" );
							
							if ( cindex != 0 )
								if ( item_authors == "" )
									item_citation = item_citation.replace( "(, ", "" );
								else
									item_citation = item_citation.replace( "(", "" );
						}
					}
					
					// Add anchors
					item_citation = "<a class='zp-ZotpressInText' href='#zp-ID-"+item.post_id+"-"+item.api_user_id+"-"+item.key+"'>" + item_citation + "</a>";
					
					// Add to intext_citation array
					intext_citation[cindex]["bib"] = item_citation;
					
				}); // format each item
				
				
				
				// Format citation group
				var intext_citation_pre = ""; if ( intext_citation_params.brackets ) intext_citation_pre = "["; // &#91;
				var intext_citation_post = ""; if ( intext_citation_params.brackets ) intext_citation_post = "]"; // &#93;
				
				intext_citation_output = intext_citation_pre;
				
				jQuery.each( intext_citation, function(cindex, item)
				{
					// Determine separator
					if ( cindex != 0 )
					{
						if ( intext_citation_params.separator == "comma" )
							intext_citation_output += "; ";
						else
							intext_citation_output += ", ";
					}
					intext_citation_output += item.bib;
					
				}); // display each item
				
				intext_citation_output += intext_citation_post;
				
				// Add to placeholder
				jQuery("#"+intext_citation_id).removeClass("loading").html(intext_citation_output);
				
			}); // each intext_citation
			
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