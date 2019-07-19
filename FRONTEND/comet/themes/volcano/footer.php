<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */
?>
	</div><!-- #main .wrapper -->
    <footer>
    <?php if ( is_singular() ) : ?>
    <div class="entry-meta">
    	<p>Last edited by <?php echo the_modified_author(); ?> on <?php echo get_the_modified_date("jS F Y"); ?></p> <!-- "d/m/y" -->

    </div>
    <?php endif; ?>
	<?php if ( is_active_sidebar( 'volcano_footer' ) ) : ?>
		<div id="site-footer-widget">
			<?php dynamic_sidebar( 'volcano_footer' ); ?>
		</div><!-- #site-footer-widget -->
	<?php endif; ?>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
