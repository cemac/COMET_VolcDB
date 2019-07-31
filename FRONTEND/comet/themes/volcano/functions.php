<?php 
add_action( 'init', 'create_post_type' );
function create_post_type() {
	register_post_type( 'volcano',
            array(
                'labels' => array(
                    'name' => __( 'Volcanoes' ),
                    'singular_name' => __( 'Volcano' ),
                    'add_new' => __( 'Add volcano' ),
                    'all_items' => __( 'All volcanoes' ),
                    'add_new_item' => __( 'Add volcano' ),
                    'edit_item' => __( 'Edit volcano' ),
                    'new_item' => __( 'New volcano' ),
                    'view_item' => __( 'View volcano' ),
                    'search_items' => __( 'Search volcanoes' ),
                    'not_found' => __( 'No volcano found' ),
                    'not_found_in_trash' => __( 'No volcano found in trash' ),
                    'parent_item_colon' => __( 'Parent volcano' )
                ),
                'supports' => array(
                    'title',
                    'editor',
                    //'excerpt',
                    //'thumbnail',
                    'author',
                    //'trackbacks',
                    //'custom-fields',
                    //'comments',
                    'revisions',
                    //'page-attributes', // (menu order, hierarchical must be true to show Parent option)
                    //'post-formats',
                ),
		'show_ui' => true,
                'taxonomies' => array('category'), // add default post categories and tags
		'public' => true,
		'has_archive' => true,
                'rewrite' => array('slug' => 'volcano', 'with_front'=>true),
                'menu_position' => 2,
                'hierarchical' => true,
		'capability_type' => 'volcano',
		'map_meta_cap' => true
		)
	);
	register_post_type( 'volcanodetail',
            array(
                'labels' => array(
                    'name' => __( 'Volcano photo' ),
                    'singular_name' => __( 'Volcano photo' ),
                    'add_new' => __( 'Add volcano photo' ),
                    'all_items' => __( 'All volcano photos' ),
                    'add_new_item' => __( 'Add volcano photo' ),
                    'edit_item' => __( 'Edit volcano photo' ),
                    'new_item' => __( 'New volcano photo' ),
                    'view_item' => __( 'View volcano photo' ),
                    'search_items' => __( 'Search volcano photos' ),
                    'not_found' => __( 'No volcano found' ),
                    'not_found_in_trash' => __( 'No volcano photo found in trash' ),
                    'parent_item_colon' => __( 'Parent volcano' )
                ),
                'supports' => array(
                    'title',
                    //'editor',
                    //'excerpt',
                    //'thumbnail',
                    'author',
                    //'trackbacks',
                    //'custom-fields',
                    //'comments',
                    'revisions',
                    //'page-attributes', // (menu order, hierarchical must be true to show Parent option)
                    //'post-formats',
                ),
		'show_ui' => false,
		'show_in_nav_menus' => false,
                'taxonomies' => array( 'category' ), // add default post categories and tags
		'public' => true,
		'has_archive' => true,
                //'rewrite' => array('slug' => 'volcanophoto', 'with_front'=>true),
                'menu_position' => 6,
		//'exclude_from_search' => true,
                //'hierarchical' => true
		)
	);
}

function wpa8582_add_volcano_children( $post_id ) {  
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
        return;

    if ( !wp_is_post_revision( $post_id )
    && 'volcano' == get_post_type( $post_id )
    && 'auto-draft' != get_post_status( $post_id )
	&& 'trash' != get_post_status( $post_id )) {  
        $volcano = get_post( $post_id );
		$parent_title = get_the_title( $post_id );
        if( 0 == $volcano->post_parent ){
            $children =& get_children(
                array(
                    'post_parent' => $post_id,
                    'post_type' => 'volcanodetail'
                )
            );
            if( empty( $children ) ){
                $child = array(
                    'post_type' => 'volcanodetail',
                    'post_title' => $parent_title,
                    'post_content' => '',
                    'post_status' => 'publish',
                    'post_parent' => $post_id,
                    'post_author' => 1 
                );
                wp_insert_post( $child );
            }
        }
    }
}
add_action( 'save_post_volcano', 'wpa8582_add_volcano_children' );

// Only search for posts and support articles
function filter_search($query)
{
    if( $query->is_search ) {
                $query->set('post_type', array('volcano'));
                $query->set('category_name', $cat);
                $query->set('post_status', array('publish'));
        }

    return $query;
}
add_filter('pre_get_posts', 'filter_search');


/**
 * Adds the individual sections, settings, and controls to the theme customizer
 */
function example_customizer( $wp_customize ) {
    $wp_customize->add_section(
        'example_section_one',
        array(
            'title' => 'Extra fields',
            'description' => 'Extra fields for the site.',
            'priority' => 35,
        )
    );
	
	$wp_customize->add_setting(
    'sentinel_textbox',
    array(
        'default' => '',
    )
);	
	
	$wp_customize->add_control(
    'sentinel_textbox',
    array(
        'label' => 'Text for Sentinel-Data page',
        'section' => 'example_section_one',
        'type' => 'text',
    )
);
}
add_action( 'customize_register', 'example_customizer' );

/* Register widget area for footer of template */
function volcano_widgets_init() {

    register_sidebar( array(
        'name'          => 'Footer',
        'id'            => 'volcano_footer',
        'before_widget' => '',
        'after_widget'  => '',
        'before_title'  => '',
        'after_title'   => '',
    ) );

}
add_action( 'widgets_init', 'volcano_widgets_init' );


function volcano_index_setup_scripts() {
    if ( is_page_template('volcano-index.php')  ){
        // wp_enqueue_style( 'style-name', get_stylesheet_uri() );
    //  wp_enqueue_script ( string $handle, string|bool $src = false, array $deps = array(), string|bool $ver = false, bool $in_footer = false )
        wp_enqueue_script('show-hide-volcano-links', '/wp-content/themes/volcano/js/toggle-links.js', array('jquery'), '1.0.1', true );
    }
}

add_action( 'wp_enqueue_scripts', 'volcano_index_setup_scripts' );
