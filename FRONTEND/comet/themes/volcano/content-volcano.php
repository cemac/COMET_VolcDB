<?php
/**
 * The template for displaying posts in the Link post format
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 */

$volcano_number =  get_field('volcano_number');
$country =  get_field('country');
$longitude =  get_field('longitude');
$latitude =  get_field('latitude');
$country =  get_field('country');
$geodetic_measurements = get_field('geodetic_measurements');
$deformation_observation = get_field('deformation_observation');
$measurement_methods =  implode(', ', get_field('measurement_method'));
$duration = get_field('duration_of_observation');
$inferred_cause = implode(', ', (array)get_field('inferred_cause'));
$characteristics = get_field('characteristics_of_deformation');
$reference1 = get_field('reference_1');
$reference2 = get_field('reference_2');
$reference3 = get_field('reference_3');
$reference4 = get_field('reference_4');
$reference5 = get_field('reference_5');
$fig1stem = get_field('figure_1_filestem');
$fig2stem = get_field('figure_2_filestem');
$fig1cap = get_field('figure_1_caption');
$fig2cap = get_field('figure_2_caption');
$title = $post->post_name;
$path = get_stylesheet_directory_uri();
$category = get_the_category();
$region =  $category[0]->cat_name;
?>
 
<style type="text/css">

.acf-map {
	width: 100%;
	height: 500px;
	border: #ccc solid 1px;
	margin: 20px 0;
}

</style>
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
<script type="text/javascript">
(function($) {

/*
*  render_map
*
*  This function will render a Google Map onto the selected jQuery element
*
*  @type	function
*  @date	8/11/2013
*  @since	4.3.0
*
*  @param	$el (jQuery element)
*  @return	n/a
*/

function render_map( $el ) {

	// var
	var $markers = $el.find('.marker');

	// vars
	var args = {
		zoom		: 10,
		center		: new google.maps.LatLng(0, 0),
		mapTypeId	: 'terrain'
	};

	// create map	        	
	var map = new google.maps.Map( $el[0], args);

	// add a markers reference
	map.markers = [];

	// add markers
	$markers.each(function(){

    	add_marker( $(this), map );

	});

	// center map
	center_map( map );

}

/*
*  add_marker
*
*  This function will add a marker to the selected Google Map
*
*  @type	function
*  @date	8/11/2013
*  @since	4.3.0
*
*  @param	$marker (jQuery element)
*  @param	map (Google Map object)
*  @return	n/a
*/

function add_marker( $marker, map ) {

	// var
	var latlng = new google.maps.LatLng( $marker.attr('data-lat'), $marker.attr('data-lng') );

	// create marker
	var marker = new google.maps.Marker({
		position	: latlng,
		map			: map
	});

	// add to array
	map.markers.push( marker );

	// if marker contains HTML, add it to an infoWindow
	if( $marker.html() )
	{
		// create info window
		var infowindow = new google.maps.InfoWindow({
			content		: $marker.html()
		});

		// show info window when marker is clicked
		google.maps.event.addListener(marker, 'click', function() {

			infowindow.open( map, marker );

		});
	}

}

/*
*  center_map
*
*  This function will center the map, showing all markers attached to this map
*
*  @type	function
*  @date	8/11/2013
*  @since	4.3.0
*
*  @param	map (Google Map object)
*  @return	n/a
*/

function center_map( map ) {

	// vars
	var bounds = new google.maps.LatLngBounds();

	// loop through all markers and create bounds
	$.each( map.markers, function( i, marker ){

		var latlng = new google.maps.LatLng( marker.position.lat(), marker.position.lng() );

		bounds.extend( latlng );

	});

	// only 1 marker?
	if( map.markers.length == 1 )
	{
		// set center of map
	    map.setCenter( bounds.getCenter() );
	    map.setZoom( 10 );
	}
	else
	{
		// fit to bounds
		map.fitBounds( bounds );
	}

}

/*
*  document ready
*
*  This function will render each map when the document is ready (page has loaded)
*
*  @type	function
*  @date	8/11/2013
*  @since	5.0.0
*
*  @param	n/a
*  @return	n/a
*/

$(document).ready(function(){

	$('.acf-map').each(function(){

		render_map( $(this) );

	});

});

})(jQuery);
</script>




<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<?php
			the_title( '<h1 class="entry-title">', '</h1>' );
		?>
	</header><!-- .entry-header -->

	<?php
		//$image_title = $post->post_name;
		
		echo '<ul class="tabrow">';
		echo '<li class="selected">Observations of Deformation</li>';
		echo '<li><a href="/volcanodetail/'.$title.'">Latest Sentinel-1 Data</a></li>';
		echo '<li><a href="/wp-content/themes/volcano/volcano-export.php?volcano_name='.$name.'">Export as CSV</a></li>';
		echo '</ul>';
	?>
	
	<div class="entry-content">
		<table>
			<tr><th>Volcano number:</th><td><?php echo $volcano_number; ?></td></tr>
			<tr><th>Region:</th><td><?php echo $region; ?></td></tr>
			<tr><th>Country:</th><td><?php echo $country; ?></td></tr>
			<tr><th>Geodetic measurements?</th><td><?php echo $geodetic_measurements; ?></td></tr>
			<tr><th>Deformation observation?</th><td><?php echo $deformation_observation; ?></td></tr>
			<tr><th>Measurement method(s):</th><td><?php echo $measurement_methods; ?></td></tr>
			<tr><th>Duration of observation:</th><td><?php echo $duration; ?></td></tr>
			<tr><th>Inferred cause of deformation:</th><td><?php echo $inferred_cause; ?></td></tr>
			<tr><th>Characteristics of deformation:</th><td><?php echo $characteristics; ?></td></tr>
			<tr><th>Reference:</th><td><?php echo $reference1; ?></td></tr>
			<?php if ($reference2) : ?><tr><th>Reference:</th><td><?php echo $reference2; ?></td></tr><?php endif ?>
			<?php if ($reference3) : ?><tr><th>Reference:</th><td><?php echo $reference3; ?></td></tr><?php endif ?>
			<?php if ($reference4) : ?><tr><th>Reference:</th><td><?php echo $reference4; ?></td></tr><?php endif ?>
			<?php if ($reference5) : ?><tr><th>Reference:</th><td><?php echo $reference5; ?></td></tr><?php endif ?>
			<tr><th>Location:</th><td><?php echo $longitude . ', '. $latitude; ?></td></tr>
		</table>
		<div class="acf-map">
			<div class="marker" data-lat="<?php echo $latitude; ?>" data-lng="<?php echo $longitude; ?>"></div>
		</div>
		<?php
			
			$rootdir = dirname(realpath(__FILE__));
			
			if ($fig1stem && file_exists("$rootdir/images/figures_static/$fig1stem")) {
				echo '<img src="'.$path.'/images/figures_static/'.$fig1stem.'"  class="volc_image" />';
			} else {
				echo '<img src="'.$path.'/images/placeholder.jpg" />';
			}

			if ($fig1cap != '') {
				$caption1 = sanitize_text_field( $fig1cap );
				echo "<p>$caption1</p>";
			}

			if ($fig2stem && file_exists("$rootdir/images/figures_static/$fig2stem")) {
				echo '<img src="'.$path.'/images/figures_static/'.$fig2stem.'"  class="volc_image" />';
			}  elseif ($fig2cap != '') {
				echo '<img src="'.$path.'/images/placeholder.jpg" />';
			}

			if ($fig2cap != '') {
				$caption2 = sanitize_text_field( $fig2cap );
				echo "<p>$caption2</p>";
			}



		?>
	</div><!-- .entry-content -->
</article><!-- #post-## -->
