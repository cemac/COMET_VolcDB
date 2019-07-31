<?php
require_once("../../../wp-load.php");

$volcano_name = "";
if (array_key_exists( 'volcano_name',$_GET)) {
   $volcano_name = $_GET['volcano_name'];
}

if (trim($volcano_name) == "" or $volcano_name == NULL)
{
    $volcano_name = "all";
}
else
{
    $volcano_name = sanitize_text_field($volcano_name);
}
header("Content-Type: text/csv; charset=utf-8");
header("Content-Disposition: attachment; filename=volcano-" . $volcano_name . ".csv");


$columns = array("post_title",
"post_name",
"post_modified",
"post_date",
"post_content",
"volcano_number",
"latitude",
"longitude",
"country",
"geodetic_measurements",
"deformation_observation",
"measurement_method",
"measurement_methods_other",
"duration_of_observation",
"inferred_cause",
"inferred_cause_of_deformation_other",
"characteristics_of_deformation",
"reference_1",
"reference_2",
"reference_3",
"reference_4",
"reference_5"
);

// Write to output stream
$output = fopen('php://output', 'w');
fputcsv($output, $columns);

$args = array('suppress_filters' => true,
              'post_type' => 'volcano',
              'post_status' => 'publish');

if ($volcano_name == "all")
{
    $extra_args = array('posts_per_page' => -1,
                        'posts_per_page' => -1,
                        'offset'         => 0,
                        'orderby'        => 'title',
                        'order'          => 'ASC');
    $args = array_merge($args, $extra_args);
}
else
{
    $extra_args = array('name' => $volcano_name);
    $args = array_merge($args, $extra_args);
}

$posts = get_posts($args);

foreach ($posts as $post)
{
    setup_postdata( $post );
    $values = array($post->post_title,
                    $post->post_name,
                    $post->post_modified,
                    $post->post_date,
                    $post->post_content,
                    $post->volcano_number,
                    $post->latitude,
                    $post->longitude,
                    $post->country,
                    $post->geodetic_measurements,
                    $post->deformation_observation,
                    implode(', ', $post->measurement_method),
                    $post->measurement_methods_other,
                    $post->duration_of_observation,
                    implode(', ', (array)$post->inferred_cause),
                    $post->inferred_cause_of_deformation_other,
                    $post->characteristics_of_deformation,
                    $post->reference_1,
                    $post->reference_2,
                    $post->reference_3,
                    $post->reference_4,
                    $post->reference_5);
    fputcsv($output, $values);
}
?>
