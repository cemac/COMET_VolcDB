
function display_licsar_images(index) {

  /* image index: */
  if (index == undefined) {
    var image_index = 0;
  } else {
    var image_index = index;
  };

  /* get image elements: */
  var cc_img = document.getElementById('licsar_cc_img');
//  var mag_img = document.getElementById('licsar_mag_img');
  var pha_img = document.getElementById('licsar_pha_img');
  var unw_img = document.getElementById('licsar_unw_img');

  /* get image label div: */
  var image_label_div = document.getElementById('licsar_image_value');

  /* get image paths: */
  var image_path = licsar_images['images'][image_index];

  /* get image label: */
  var image_label = licsar_images['dates'][image_index];

  /* set images: */
  cc_img.src = url+image_path[0];
//  mag_img.src = image_path[1];
  pha_img.src = url+image_path[1];
  unw_img.src = url+image_path[2];

  /* set image label: */
  image_label_div.innerHTML = '<label>' +
    image_label +
    '</label>';

  /* get image slider div: */
  var slider_div = document.getElementById('licsar_image_control');

  /* if slider does not exist: */
  if (slider_div.noUiSlider == undefined) {
    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = licsar_images['count'] - 1;
    /* create slider: */
    noUiSlider.create(slider_div, {
      start: image_index,
      range: {
        min: slider_range_min,
        max: slider_range_max
      },
      step: 1,
      tooltips: false
    });
    /* add change listerner: */
    slider_div.noUiSlider.on('change', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* index to int: */
      var slider_index = parseInt(slider_value);
      /* label: */
      var slider_date = licsar_images['dates'][slider_index];
      /* update image: */
      display_licsar_images(slider_index);
    });
    /* add slide listerner: */
    slider_div.noUiSlider.on('slide', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* index to int: */
      var slider_index = parseInt(slider_value);
      /* label: */
      var slider_date = licsar_images['dates'][slider_index];
      /* set labels: */
      image_label_div.innerHTML = '<label>' +
        slider_date +
        '</label>';
    });
  };
}

/* on page load: */
window.addEventListener('load', function() {
  /* display!: */
  display_licsar_images();
});
