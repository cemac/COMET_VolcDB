<?php
/**
 * The template for displaying posts in the Link post format
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<header class="entry-header">
		<?php
				the_title( '<h1 class="entry-title">', '</h1>' );
		?>	
	</header><!-- .entry-header -->

	<?php
		$title = $post->post_name;
	
		echo '<ul class="tabrow">';
		echo '<li><a href="/volcano/'.$title.'">Observations of Deformation</a></li>';
		echo '<li class="selected">Latest Sentinel-1 Data</li>';
		echo '<li><a href="/wp-content/themes/volcano/volcano-export.php?volcano_name='.$name.'">Export as CSV</a></li>';
		echo '</ul>';
	?>
	
	
	<div class="entry-content">
		<?php
			$title = $post->post_name;
			$path = get_stylesheet_directory_uri();
			//$captionfile = $path . '/text/' . $title. '.txt';
			//$caption = file_get_contents($captionfile);
			//$caption = sanitize_text_field( $caption );

			$parent_post = wp_get_post_parent_id($post->post_id);
			//echo $parent_post;
			//$variable = get_field('field_name', $post->ID);
			$fig1stem = get_field('figure_1_filestem',$parent_post);
			$fig2stem = get_field('figure_2_filestem',$parent_post);
			$fig1cap = get_field('figure_1_caption',$parent_post);
			$fig2cap = get_field('figure_2_caption',$parent_post);
		?>
		
			
		
<?php echo get_theme_mod( 'sentinel_textbox', 'No copyright information has been saved yet.' ); ?>			

		<?php
			
			//$path = get_stylesheet_directory_uri();
			//if ($fig1stem && file_exists("/images/$fig1stem")) {
			//	echo '<img src="'.$path.'/images/'.$fig1stem.'" />';
			//} else {
			//	echo '<img src="'.$path.'/images/placeholder.jpg" />';
			//}
			//if ($fig1cap != '') {
			//	$caption1 = sanitize_text_field( $fig1cap );
			//	echo "<p>$caption1</p>";
			//}
			//if ($fig2stem && file_exists("/images/$fig2stem")) {
			//	echo '<img src="'.$path.'/images/'.$fig2stem.'" />';
			//}  elseif ($fig2cap != '') {
			//	echo '<img src="'.$path.'/images/placeholder.jpg" />';
			//}
			//if ($fig2cap != '') {
			//	$caption2 = sanitize_text_field( $fig2cap );
			//	echo "<p>$caption2</p>";
			//}



		?>
		<?php
		
		$volc_dir = preg_replace('/-/', '_', $title);
		//// Commented out for now, as no images available via this route.
		////
		//// pull unknown number of images and textfiles from a directory
		$imagedir =  dirname(realpath(__FILE__)).'/images/figures_sentinel/'.$volc_dir;
                        if (file_exists($imagedir) && ($handle = opendir($imagedir))) {
				while (false !== ($file = readdir($handle))) {
					$pos = strpos($file, $title);
					if ($pos === 0) {
						$fileinfo = pathinfo($file);
						//$textstem = pathinfo($file)['filename'];
						$path = get_stylesheet_directory_uri();
						//$captionfile = $path . '/text/' . $textstem. '.txt';
						//$caption = file_get_contents($captionfile);
						//$caption = sanitize_text_field( $caption );
						echo '<img src="'.$path.'/images/figures_sentinel/'.$volc_dir.'/'.$file.'" />';
                                                //echo $caption;
					}
		
				}
				closedir($handle);
			}
		?>
		
	</div><!-- .entry-content -->

</article><!-- #post-## -->
