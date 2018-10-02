<?php
 
class zotpressLib
{
	/**
	 * Creates a HTML-formatted library for the selected account.
	 *
	 * @return     string         	the HTML-formatted subcollections
	 */
	
	private $account = "";
	private $type = false;
	private $filters = false;
	private $minlength = false;
	private $maxresults = false;
	private $maxperpage = false;
	private $maxtags = false;
	private $style = false;
	private $sortby = false;
	private $order = false;
	private $citeable = false;
	private $downloadable = false;
	private $showimage = false;
	private $is_admin = false;
	private $urlwrap = false;
	private $target = false;
	
	public function __construct()
	{
		// Called automatically when an instance is instantiated
	}
	
	public function setAccount($account)
	{
		$this->account = $account;
	}
	
	public function getAccount()
	{
		return $this->account;
	}
	
	public function setType($type)
	{
		$this->type = $type;
	}
	
	public function setFilters($filters)
	{
		$this->filters = $filters;
	}
	
	public function setMinLength($minlength)
	{
		$this->minlength = $minlength;
	}
	
	public function getMinLength()
	{
		return $this->minlength;
	}
	
	public function setMaxResults($maxresults)
	{
		$this->maxresults = $maxresults;
	}
	
	public function getMaxResults()
	{
		return $this->maxresults;
	}
	
	public function setMaxPerPage($maxperpage)
	{
		$this->maxperpage = $maxperpage;
	}
	
	public function getMaxPerPage()
	{
		return $this->maxperpage;
	}
	
	public function setMaxTags($maxtags)
	{
		$this->maxtags = $maxtags;
	}
	
	public function setCiteable($citeable)
	{
		$this->citeable = $citeable;
	}
	
	public function setStyle($style)
	{
		$this->style = strtolower( $style );
	}
	
	public function setSortBy($sortby)
	{
		$this->sortby = strtolower( $sortby );
	}
	
	public function setOrder($order)
	{
		$this->order = strtolower( $order );
	}
	
	public function setDownloadable($download)
	{
		$this->downloadable = $download;
	}
	
	public function setShowImage($showimage)
	{
		if ( $showimage == "yes" || $showimage == "true" || $showimage == true ) $showimage = true;
		else $showimage = false;
		
		$this->showimage = $showimage;
	}
	
	public function setAdmin($setAdmin)
	{
		$this->is_admin = $setAdmin;
	}
	
	public function setURLWrap($urlwrap)
	{
		$this->urlwrap = $urlwrap;
	}
	
	public function setTarget($target)
	{
		$this->target = $target;
	}
	
	
	
	public function getLib()
	{
		global $wpdb;
		
		
		// Enqueue scripts
		
		if ( $this->type == "dropdown" )
		{
			wp_enqueue_script( 'zotpress.lib.js' );
			wp_enqueue_script( 'zotpress.lib.dropdown.js' );
		}
		else
		{
			wp_enqueue_script( 'jquery-ui-autocomplete' );
			wp_enqueue_script( 'zotpress.lib.js' );
			wp_enqueue_script( 'zotpress.lib.searchbar.js' );
		}
		
		
		// API User ID
		
		global $api_user_id;
		
		if ( isset($_GET['account_id']) && preg_match("/^[0-9]+$/", $_GET['account_id']) )
			$api_user_id = $wpdb->get_var("SELECT nickname FROM ".$wpdb->prefix."zotpress WHERE id='".$_GET['account_id']."'", OBJECT);
		else
			$api_user_id = $this->getAccount()->api_user_id;
		
		
		// Collection ID
		
		global $collection_id;
		
		if (isset($_GET['collection_id']) && preg_match("/^[0-9a-zA-Z]+$/", $_GET['collection_id']))
			$collection_id = trim($_GET['collection_id']);
		else
			$collection_id = false;
		
		
		// Collection Name
		
		global $collection_name;
		
		if (isset($_GET['collection_name']))
			if ( strpos( $_GET['collection_name'], "- " ) == 0 )
				$collection_name = preg_replace( "/- /", "", $_GET['collection_name'], 1 );
			else
				$collection_name = trim($_GET['collection_name']);
		else
			$collection_name = false;
		
		
		// Tag Name
		
		global $tag_id;
		
		if (isset($_GET['tag_id']) && strlen(trim($_GET['tag_id'])) > 0 )
			$tag_id = htmlentities(trim($_GET['tag_id']));
		else
			$tag_id = false;
		
		
		?>
            <div id="zp-Browse">
				
				<span id="ZP_API_USER_ID" style="display: none;"><?php echo $api_user_id; ?></span>
				<?php if ( $collection_id ): ?><span id="ZP_COLLECTION_ID" style="display: none;"><?php echo $collection_id; ?></span><?php endif; ?>
				<?php if ( $collection_name ): ?><span id="ZP_COLLECTION_NAME" style="display: none;"><?php echo $collection_name; ?></span><?php endif; ?>
				<?php if ( $tag_id ): ?><span id="ZP_TAG_ID" style="display: none;"><?php echo $tag_id; ?></span><?php endif; ?>
				<span id="ZP_MAXTAGS" style="display: none;"><?php echo $this->maxtags; ?></span>
				<span id="ZP_STYLE" style="display: none;"><?php echo $this->style; ?></span>
				<span id="ZP_SORTBY" style="display: none;"><?php echo $this->sortby; ?></span>
				<span id="ZP_ORDER" style="display: none;"><?php echo $this->order; ?></span>
				<span id="ZP_CITEABLE" style="display: none;"><?php echo $this->citeable; ?></span>
				<span id="ZP_DOWNLOADABLE" style="display: none;"><?php echo $this->downloadable; ?></span>
				<span id="ZP_SHOWIMAGE" style="display: none;"><?php echo $this->showimage; ?></span>
				<span id="ZP_TARGET" style="display: none;"><?php echo $this->target; ?></span>
				<span id="ZP_URLWRAP" style="display: none;"><?php echo $this->urlwrap; ?></span>
				<?php if ( $this->is_admin ):?><span id="ZP_ISADMIN" style="display: none;"><?php echo $this->is_admin; ?></span><?php endif; ?>
                
                <div id="zp-Browse-Bar">
					
					<?php if ( $this->type == "dropdown" ): ?>
                    
                    <div id="zp-Browse-Collections">
						<?php
						
						echo "<div class='zp-Browse-Select'>\n";
						echo "<select id='zp-Browse-Collections-Select' class='loading'>\n";
						
						// Set default option
						echo "<option class='loading' value='loading'>Loading ...</option>";
						if ( $tag_id ) echo "<option value='blank'>--No Collection Selected--</option>";
						if ( ! $tag_id && ! $collection_id ) echo "<option value='toplevel'>Top level</option>";
						
						echo "</select>\n";
						echo "</div>\n\n";
						
						?>
                    </div><!-- #zp-Browse-Collections -->
                    
                    
                    <div id="zp-Browse-Tags">
                        <?php
						
						echo "<div class='zp-Browse-Select'>\n";
						echo '<select id="zp-List-Tags" name="zp-List-Tags" class="loading">';
						echo "\n<option class='loading' value='loading'>Loading ...</option>\n";
						echo "</select>\n";
						echo "</div>\n\n";
						
                        ?>
                    </div><!-- #zp-Browse-Tags -->
					
					<?php else: ?>
					
					<div id="zp-Zotpress-SearchBox">
						<input id="zp-Zotpress-SearchBox-Input" class="help" type="text" value="Type to search" />
						
						<?php if ( $this->filters ):
						
						echo "<span class=\"zp-SearchBy\">Search by:</span>";
						
						// Turn filter string into array
						$filters = explode( ",", $this->filters );
						
						foreach ( $filters as $id => $filter )
						{
							// Account for singular words
							if ( $filter == "tags" ) $filter = "tag";
							else $filter = "item";
							
							echo '<input type="radio" name="zpSearchFilters" id="'.$filter.'" value="'.$filter.'"';
							if ( $id == 0 || count($filters) == 1 ) echo ' checked="checked"';
							echo '><label for="'.$filter.'">'.$filter.'</label>';
							echo "\n";
						}
						
						endif; // Filters
						
						
						// Min Length
						$minlength = 3; if ( $this->getMinLength() ) $minlength = intval($this->getMinLength());
						echo '<input type="hidden" id="ZOTPRESS_AC_MINLENGTH" name="ZOTPRESS_AC_MINLENGTH" value="'.$minlength.'" />';
						
						// Max Results
						$maxresults = 50; if ( $this->getMaxResults() ) $maxresults = intval($this->getMaxResults());
						echo '<input type="hidden" id="ZOTPRESS_AC_MAXRESULTS" name="ZOTPRESS_AC_MAXRESULTS" value="'.$maxresults.'" />';
						
						// Max Per Page
						$maxperpage = 10; if ( $this->getMaxPerPage() ) $maxperpage = intval($this->getMaxPerPage());
						echo '<input type="hidden" id="ZOTPRESS_AC_MAXPERPAGE" name="ZOTPRESS_AC_MAXPERPAGE" value="'.$maxperpage.'" />';
						
						// Downloadable, Citeable, Showimages
						$downloadable = false; if ( $this->downloadable ) $downloadable = $this->downloadable;
						$citeable = false; if ( $this->citeable ) $citeable = $this->citeable;
						$showimages = false; if ( $this->showimage ) $showimages = $this->showimage;
						
						echo '<input type="hidden" id="ZOTPRESS_AC_DOWNLOAD" name="ZOTPRESS_AC_DOWNLOAD" value="'.$downloadable.'" />';
						echo '<input type="hidden" id="ZOTPRESS_AC_CITE" name="ZOTPRESS_AC_CITE" value="'.$citeable.'" />';
						if ( $showimages ) echo '<input type="hidden" id="ZOTPRESS_AC_IMAGES" name="ZOTPRESS_AC_IMAGES" value="true" />';
						
						?>
						
						<input type="hidden" id="ZOTPRESS_PLUGIN_URL" name="ZOTPRESS_PLUGIN_URL" value="<?php echo ZOTPRESS_PLUGIN_URL; ?>" />
						<input type="hidden" id="ZOTPRESS_USER" name="ZOTPRESS_USER" value="<?php echo $this->getAccount()->api_user_id; ?>" />
					</div>
					
                    <?php endif; // Type ?>
					
                </div><!-- #zp-Browse-Bar -->
                
				
                <div class="zp-List<?php
				
				if ( $this->type == "dropdown" )
				{
					echo ' loading">';
					
					// Display title on dropdown version
					if ( $collection_id )
					{
						echo "<div class='zp-Collection-Title'>";
							echo "<span class='name'>";
							if ( $collection_name )
								echo htmlspecialchars( $collection_name, ENT_QUOTES );
							else
								echo "Collection items:";
							echo "</span>";
							if ( is_admin() ) echo "<span class='item_key'>".$collection_id."</span>\n";
						echo "</div>\n";
					}
					else if ( $tag_id ) // Top Level
					{
						echo "<div class='zp-Collection-Title'>Viewing items tagged \"<strong>".str_replace("+", " ", $tag_id)."</strong>\"</div>\n";
					}
					else
					{
						echo "<div class='zp-Collection-Title'>Top Level Items</div>\n";
					}
				}
				
				// Searchbar
				else
				{
					echo "\">";
					
					// Autocomplete will fill this up
					echo '<img class="zpSearchLoading" src="'.ZOTPRESS_PLUGIN_URL.'/images/loading_default.gif" alt="thinking" />';
				}
				
				// Container for results
				echo '<div id="zpSearchResultsContainer"></div>';
				
				// Pagination
				echo '<div id="zpSearchResultsPaging"></div>';
				
				?>
                
                </div><!-- .zp-List -->
                
            </div><!-- #zp-Browse -->
		<?php
	}
}
 
?>