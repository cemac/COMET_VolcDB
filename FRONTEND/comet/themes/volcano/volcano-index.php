<?php
/**
 * Template Name: Volcano Index Template
 *
 * Description: A page template that provides a key component of WordPress as a CMS
 * by meeting the need for a carefully crafted introductory page. The front page template
 * in Twenty Twelve consists of a page content area for adding text, images, video --
 * anything you'd like -- followed by front-page-only widgets in one or two columns.
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */

get_header(); ?>

    <div id="primary" class="site-content">
        <div id="content" role="main">
            <header class="entry-header">
                    <?php
            the_title( '<h1 class="entry-title">', '</h1>' );
        ?>
            </header>
            <div class="support-index">
                <p class="download-as-csv"><a  class="button" href="/wp-content/themes/volcano/volcano-export.php">Download volcano data as CSV</a></p>
        <?php
            $args = array(
              'orderby' => 'name',
              'order' => 'ASC'
            );
            $categories = get_categories($args);
              foreach($categories as $category) {
                if ($category->name != 'Uncategorized') {
            ?>
                <article class="hideable-links"><!-- ref icons sourced from https://icons8.com/ -->
                    <h2 class="toggleable-header" id="<?php echo $category->slug; ?>" title="Click to show/hide volcano links"><?php echo $category->name; ?>&nbsp;<img class="icon icons8-Expand-Arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAATklEQVQYV2NkIBIwEqmOAaRQAKr4Aw5NYHmYwgkMDAwFDAwM6IpBisByMKvhAkiKUcSQ3YgsAbINxRZ0z8AUgxSiOAWbr7F6jqTgISooAXv+Div1AkyaAAAAAElFTkSuQmCC" width="10" height="10" alt="Expand arrow"></h2>
                    <ul class="toggleable-links double-col" id="listing-<?php echo $category->slug; ?>">
                        <?php
                        $counter = 0;
                        global $post;
                        $args = array(
                            'posts_per_page'   => -1,
                            'offset'           => 0,
                            'category_name'    => $category->slug,
                            'orderby'          => 'title',
                            'order'            => 'ASC',
                            'post_type'        => 'volcano',
                            'post_status'      => 'publish',
                            'suppress_filters' => true );
                        $myposts = get_posts($args);
                        foreach($myposts as $post) :
                        ?>
                        <li><a href="<?php the_permalink(); ?>" >
                            <?php the_title(); ?> 
                            </a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                    <div class="back-to-top">
                        <a href="#content">Back to top</a>
                    </div>
                </article>
<?php } } ?>

<!--                echo '<p>Category: <a href="' . get_category_link( $category->term_id ) . '" title="' . sprintf( __( "View all posts in %s" ), $category->name ) . '" ' . '>' . $category->name.'</a> </p> ';
                echo '<p> Description:'. $category->description . '</p>';
                echo '<p> Post Count: '. $category->count . '</p>';  } 
-->

            </div>
            <p class="download-as-csv"><a class="button" href="/wp-content/themes/volcano/volcano-export.php">Download volcano data as CSV</a></p>
            <p class="back-to-top"><a href="https://icons8.com">Icons designed by Icons8<a/></p>
        </div><!-- #content -->
    </div><!-- #primary -->
<?php get_footer(); ?>
