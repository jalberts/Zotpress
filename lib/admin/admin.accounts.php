<?php

// Restrict to Editors
if ( current_user_can('edit_others_posts') )
{

	// Determine if server supports OAuth
	if (in_array ('oauth', get_loaded_extensions())) { $oauth_is_not_installed = false; } else { $oauth_is_not_installed = true; }
	
	if (isset( $_GET['oauth'] )) { include("admin.accounts.oauth.php"); } else {
	
	?>
	
		<div id="zp-Zotpress" class="wrap">
			
			<?php include( dirname(__FILE__) . '/admin.menu.php' ); ?>
			
			
			<!-- ZOTPRESS MANAGE ACCOUNTS -->
			
			<div id="zp-ManageAccounts">
				
				<h3>Synced Zotero Accounts</h3>
				<?php if (!isset( $_GET['no_accounts'] ) || (isset( $_GET['no_accounts'] ) && $_GET['no_accounts'] != "true")) { ?><a title="Sync your Zotero account" class="zp-AddAccountButton button button-secondary" href="<?php echo admin_url("admin.php?page=Zotpress&setup=true"); ?>"><span>Add account</span></a><?php } ?>
				
				<table id="zp-Accounts" class="wp-list-table widefat fixed posts">
					
					<thead>
						<tr>
							<th class="default first manage-column" scope="col">Default</th>
							<th class="account_type first manage-column" scope="col">Type</th>
							<th class="api_user_id manage-column" scope="col">User ID</th>
							<th class="public_key manage-column" scope="col">Private Key</th>
							<th class="nickname manage-column" scope="col">Nickname</th>
							<!--<th class="status manage-column" scope="col">Status</th>-->
							<th class="actions last manage-column" scope="col">Actions</th>
						</tr>
					</thead>
					
					<tbody id="zp-AccountsList">
						<?php
							
							global $wpdb;
							
							$accounts = $wpdb->get_results("SELECT * FROM ".$wpdb->prefix."zotpress");
							$zebra = " alternate";
							
							foreach ($accounts as $num => $account)
							{
								if ($num % 2 == 0) { $zebra = " alternate"; } else { $zebra = ""; }
								
								$code = "<tr id='zp-Account-" . $account->api_user_id . "' class='zp-Account".$zebra."' rel='" . $account->api_user_id . "'>\n";
								
								// DEFAULT
								$code .= "                          <td class='default";
								if ( get_option("Zotpress_DefaultAccount") && get_option("Zotpress_DefaultAccount") == $account->api_user_id ) $code .= " selected";
								$code .= " first'><a href='javascript:void(0);' rel='". $account->api_user_id ."' class='default zp-Accounts-Default' title='Set as Default'>Set as Default</a></td>\n";
								
								// ACCOUNT TYPE
								$code .= "                          <td class='account_type'>" . substr($account->account_type, 0, -1) . "</td>\n";
								
								// API USER ID
								$code .= "                          <td class='api_user_id'>" . $account->api_user_id . "</td>\n";
								
								// PUBLIC KEY
								$code .= "                          <td class='public_key'>";
								if ($account->public_key)
								{
									$code .= $account->public_key;
								}
								else
								{
									add_thickbox();
									$code .= 'No private key entered. <a class="zp-OAuth-Button thickbox" href="'.get_bloginfo( 'url' ).'/wp-content/plugins/zotpress/lib/admin/admin.accounts.oauth.php?TB_iframe=true&width=600&height=480&oauth_user='.$account->api_user_id.'&amp;return_uri='.get_bloginfo('url').'">Start OAuth?</a>';
									//$code .= 'No private key entered. <a class="zp-OAuth-Button" href="'.get_bloginfo( 'url' ).'/wp-content/plugins/zotpress/lib/admin/admin.accounts.oauth.php?oauth_user='.$account->api_user_id.'&amp;return_uri='.get_bloginfo('url').'">Start OAuth?</a>';
								}
								$code .= "</td>\n";
								
								// NICKNAME
								$code .= "                          <td class='nickname'>";
								if ($account->nickname)
									$code .= $account->nickname;
								$code .= "</td>\n";
								
								// ACTIONS
								$code .= "                          <td class='actions last'>\n";
								$code .= "                              <a title='Clear Cache' class='cache' href='#" . $account->api_user_id . "'>Clear Cache</a>\n";
								$code .= "                              <a title='Remove this account' class='delete' href='#" . $account->api_user_id . "'>Remove</a>\n";
								$code .= "                          </td>\n";
								
								$code .= "                         </tr>\n\n";
								
								echo $code;
							}
						?>
					</tbody>
					
				</table>
				
			</div>
			
			<span id="ZOTPRESS_PLUGIN_URL" style="display: none;"><?php echo ZOTPRESS_PLUGIN_URL; ?></span>
			<span id="ZOTPRESS_PASSCODE" style="display: none;"><?php /*echo get_option('ZOTPRESS_PASSCODE'); */ ?></span>
			
			<?php if ( ! $oauth_is_not_installed ) { ?>
				<h3>What is OAuth?</h3>
				
				<p>
					OAuth helps you create the necessary private key for allowing Zotpress to read your Zotero library and display
					it for all to see. You can do this manually through the Zotero website; using OAuth in Zotpress is just a quicker, more straightforward way of going about it.
					<strong>Note: You'll need to have OAuth installed on your server to use this option.</strong> If you don't have OAuth installed, you'll have to generate a private key manually through the <a href="http://www.zotero.org/">Zotero</a> website.
				</p>
			<?php } ?>
			
			
		</div>
		
<?php

	} /* OAuth check */

} // !current_user_can('edit_others_posts')

else
{
	echo "<p>Sorry, you don't have permission to access this page.</p>";
}

?>