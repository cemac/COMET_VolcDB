
function display_prob_image(index) {

  /* image index: */
  if (index == undefined) {
    var image_index = probability_images['count'] - 1;
  } else {
    var image_index = index;
  };

  /* get image element: */
  var image_img = document.getElementById('prob_image_img');

  /* get image label div: */
  var image_label_div = document.getElementById('prob_image_value');

  /* get image path: */
  var image_path =  prob_img_prefix + probability_images['images'][image_index];

  /* get image label: */
  var image_label = probability_images['dates'][image_index] +
                    ' (' +
                    probability_images['means'][image_index] +
                    ')';

  /* set image: */
  image_img.src = url + image_path;

  /* set image label: */
  image_label_div.innerHTML = '<label>' +
    image_label +
    '</label>';

  /* get image slider div: */
  var slider_div = document.getElementById('prob_image_control');

  /* if slider does not exist: */
  if (slider_div.noUiSlider == undefined) {
    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = probability_images['count'] - 1;
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
      var slider_date = probability_images['dates'][slider_index];
      /* mean: */
      var slider_mean = probability_images['means'][slider_index];
      /* update image: */
      display_prob_image(slider_index);
    });
    /* add slide listerner: */
    slider_div.noUiSlider.on('slide', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* index to int: */
      var slider_index = parseInt(slider_value);
      /* label: */
      var slider_date = probability_images['dates'][slider_index];
      /* mean: */
      var slider_mean = probability_images['means'][slider_index];
      /* set labels: */
      image_label_div.innerHTML = '<label>' +
        slider_date +
        ' (' +
        slider_mean +
        ')' +
        '</label>';
    });
  };
}

/* on page load: */
window.addEventListener('load', function() {
  /* display!: */
  display_prob_image();
});
