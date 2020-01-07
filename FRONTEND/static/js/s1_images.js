
function display_prob_image(index) {

  /* image index: */
  if ((index == undefined) ||
      (index == null)) {
    var image_index = prob_data['count'] - 1;
  } else {
    var image_index = index;
  };

  /* get image element: */
  var image_img = document.getElementById('s1_prob_img');

  /* get image label div: */
  var image_label_div = document.getElementById('s1_image_value');

  /* get image path: */
  var image_path = prob_img_prefix + prob_data['images'][image_index];

  /* get image label: */
  var image_label = prob_data['dates'][image_index] + 
                    ' (' +
                    prob_data['means'][image_index] + 
                    ')';

  /* set image: */
  image_img.src = image_path;

  /* set image label: */
  image_label_div.innerHTML = '<label>' +
    image_label + 
    '</label>';

  /* get image slider div: */
  var slider_div = document.getElementById('s1_image_control');

  /* get data links span: */
  var links_span = document.getElementById('s1_data_links');

  /* set data links: */
  var links_date = prob_data['dates'][image_index]
  links_date = links_date.replace(' - ', '_');
  links_date = links_date.replace(/-/g, '');
  links_span.innerHTML = '<tr><td>Coherence</td>' +
                         '<td><a href="' + data_href_prefix + '/' + volcano_track +
                         '/' + volcano_frame + '/products/' + links_date +
                         '/' + links_date + '.geo.cc.tif">' + links_date +
                         '.geo.cc.tif</a></td>' +
                         '<td><a href="' + data_href_prefix + '/' + volcano_track +
                         '/' + volcano_frame + '/products/' + links_date +   
                         '/' + links_date + '.geo.cc.png">' + links_date +
                         '.geo.cc.png</a></td></tr>' +
                         '<tr><td>LOS change</td>' +
                         '<td><a href="' + data_href_prefix + '/' + volcano_track +
                         '/' + volcano_frame + '/products/' + links_date +   
                         '/' + links_date + '.geo.diff_pha.tif">' + links_date +
                         '.geo.diff_pha.tif</a></td>' +
                         '<td><a href="' + data_href_prefix + '/' + volcano_track +
                         '/' + volcano_frame + '/products/' + links_date +   
                         '/' + links_date + '.geo.diff.png">' + links_date +
                         '.geo.diff.png</a></td></tr>' +
                         '<tr><td>Unwrapped LOS change</td>' +
                         '<td><a href="' + data_href_prefix + '/' + volcano_track +
                         '/' + volcano_frame + '/products/' + links_date +   
                         '/' + links_date + '.geo.unw.tif">' + links_date +
                         '.geo.unw.tif</a></td>' + 
                         '<td><a href="' + data_href_prefix + '/' + volcano_track +
                         '/' + volcano_frame + '/products/' + links_date +   
                         '/' + links_date + '.geo.unw.png">' + links_date +
                         '.geo.unw.png</a></td></tr>';

  /* function to set pips where probability is visible: */
  function filterPips(value, type) {
    if (prob_data['means'][value] > 0.05 &&
        prob_data['means'][value] < 0.7) {
      return 0;
    } else {
      return -1;
    };
  };

  /* if slider does not exist or page is being updated: */
  if ((slider_div.noUiSlider == undefined) ||
      (page_update == true)) {
    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = prob_data['count'] - 1;

    /* if slider does not exist: */
    if (slider_div.noUiSlider == undefined) {
      /* create slider: */
      noUiSlider.create(slider_div, {
        start: image_index,
        range: {
          min: slider_range_min,
          max: slider_range_max
        },
        pips: {
          mode: 'steps',
          filter: filterPips
        },
        step: 1,
        tooltips: false
      });
    } else {
      /* update slider: */
      slider_div.noUiSlider.updateOptions({
        start: image_index,
        range: {
          min: slider_range_min,
          max: slider_range_max
        },
        pips: {
          mode: 'steps',
          filter: filterPips
        },
        step: 1,
        tooltips: false
      });
    };

    /* add change listerner: */
    slider_div.noUiSlider.on('change', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* index to int: */
      var slider_index = parseInt(slider_value);
      /* label: */
      var slider_date = prob_data['dates'][slider_index];
      /* mean: */
      var slider_mean = prob_data['means'][slider_index];
      /* update image: */
      display_prob_image(slider_index);
      display_licsar_images(slider_index);
    });
    /* add slide listerner: */
    slider_div.noUiSlider.on('slide', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* index to int: */
      var slider_index = parseInt(slider_value);
      /* label: */
      var slider_date = prob_data['dates'][slider_index];
      /* mean: */
      var slider_mean = prob_data['means'][slider_index];
      /* set labels: */
      image_label_div.innerHTML = '<label>' +
        slider_date + 
        ' (' + 
        slider_mean + 
        ')' + 
        '</label>';
    });
  }; 
};

function display_licsar_images(index) {

  /* image index: */
  if (index == undefined) {
    var image_index = licsar_data['count'] - 1;
  } else {
    var image_index = index;
  };

  /* get image elements: */
  var cc_img = document.getElementById('s1_cc_img');
  var pha_img = document.getElementById('s1_pha_img');
  var unw_img = document.getElementById('s1_unw_img');

  /* get image paths: */
  var image_path = licsar_data['images'][image_index];

  /* get image label: */
  var image_label = licsar_data['dates'][image_index];

  /* set images: */
  cc_img.src =  licsar_img_prefix + image_path[0];
  pha_img.src = licsar_img_prefix + image_path[1];
  unw_img.src = licsar_img_prefix + image_path[2];

};
