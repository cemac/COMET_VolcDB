
var licsar_indexes_uncorrected = {};
var licsar_indexes_corrected = {};
var licsar_indexes = null;

function display_licsar_images(index) {

  /* check if using uncorrected / corrected data and set variables
     accordingly: */
  var use_correct = frame_use_correct[volcano_frame_index];
  if (use_correct != undefined && use_correct == true) {
    licsar_indexes = licsar_indexes_corrected;
  } else {
    licsar_indexes = licsar_indexes_uncorrected;
  };

  /* image index: */
  if ((index == undefined) ||
      (index == null)) {
    if (licsar_indexes[volcano_frame] == undefined) {
      var image_index = licsar_data['count'] - 1;
    } else {
      var image_index = licsar_indexes[volcano_frame];
    };
  } else {
    var image_index = index;
  };
  licsar_indexes[volcano_frame] = image_index;

  /* get image elements: */
  var if_img = document.getElementById('licsar_if_img');

  /* get image paths: */
  var image_path = licsar_data['images'][image_index];

  /* get image label: */
  var image_label = licsar_data['dates'][image_index];

  /* set images: */
  if_img.src = licsar_img_prefix + image_path;

  /* get image label div: */
  var image_label_div = document.getElementById('licsar_image_value');

  /* get image label: */
  var image_label = (licsar_data['dates'][image_index]);

  /* set image label: */
  image_label_div.innerHTML = '<label>' +
    image_label +
    '</label>';

  /* get image slider div: */
  var slider_div = document.getElementById('licsar_image_control');

  /* get data links elements: */
  var links_cc = document.getElementById('licsar_cc_data_links');
  var links_pha = document.getElementById('licsar_pha_data_links');
  var links_unw = document.getElementById('licsar_unw_data_links');

  /* track directory in links does not have leading zeros: */
  var track_dir = parseInt(volcano_track);

  /* set data links: */
  var links_date = licsar_data['dates'][image_index]
  links_date = links_date.replace(' - ', '_');
  links_date = links_date.replace(/-/g, '');
  links_pha.innerHTML = '<div class="div_data_links"><span>Wrapped LOS change</span></div>' +
                        '<div class="div_data_links"><a target="_blank" href="' +
                        data_href_prefix + '/' + track_dir +
                        '/' + volcano_frame + '/interferograms/' + links_date +
                        '/' + links_date + '.geo.diff_pha.tif">' + links_date +
                        '.geo.diff_pha.tif</a></div>' +
                        '<div class="div_data_links"><a target="_blank" href="' +
                        data_href_prefix + '/' + track_dir +
                        '/' + volcano_frame + '/interferograms/' + links_date +
                        '/' + links_date + '.geo.diff.png">' + links_date +
                        '.geo.diff.png</a></div>';
  links_unw.innerHTML = '<div class="div_data_links"><span>Unwrapped LOS change</span></div>' +
                        '<div class="div_data_links"><a target="_blank" href="' +
                        data_href_prefix + '/' + track_dir +
                        '/' + volcano_frame + '/interferograms/' + links_date +
                        '/' + links_date + '.geo.unw.tif">' + links_date +
                        '.geo.unw.tif</a></div>' +
                        '<div class="div_data_links"><a target="_blank" href="' +
                        data_href_prefix + '/' + track_dir +
                        '/' + volcano_frame + '/interferograms/' + links_date +
                        '/' + links_date + '.geo.unw.png">' + links_date +
                        '.geo.unw.png</a></div>';
  links_cc.innerHTML = '<div class="div_data_links"><span>Coherence</span></div>' +
                       '<div class="div_data_links"><a target="_blank" href="' +
                       data_href_prefix + '/' + track_dir +
                       '/' + volcano_frame + '/interferograms/' + links_date +
                       '/' + links_date + '.geo.cc.tif">' + links_date +
                       '.geo.cc.tif</a></div>' +
                       '<div class="div_data_links"><a target="_blank" href="' +
                       data_href_prefix + '/' + track_dir +
                       '/' + volcano_frame + '/interferograms/' + links_date +
                       '/' + links_date + '.geo.cc.png">' + links_date +
                       '.geo.cc.png</a></div>';

  /* if slider does not exist or page is being updated: */
  if ((slider_div.noUiSlider == undefined) ||
      (page_update == true)) {
    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = licsar_data['count'] - 1;
    /* if slider does not exist: */
    if (slider_div.noUiSlider == undefined) {
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
      /* add change listener: */
      slider_div.noUiSlider.on('change', function() {
        /* get slider value: */
        var slider_value = slider_div.noUiSlider.get();
        /* index to int: */
        var slider_index = parseInt(slider_value);
        /* label: */
        var slider_date = licsar_data['dates'][slider_index];
        /* update image: */
        display_licsar_images(slider_index);
      });
      /* add slide listener: */
      slider_div.noUiSlider.on('slide', function() {
        /* get slider value: */
        var slider_value = slider_div.noUiSlider.get();
        /* index to int: */
        var slider_index = parseInt(slider_value);
        /* label: */
        var slider_date = licsar_data['dates'][slider_index];
        /* set labels: */
        image_label_div.innerHTML = '<label>' + slider_date + '</label>';
      });
    } else {
      /* update slider: */
      slider_div.noUiSlider.updateOptions({
        start: image_index,
        range: {
          min: slider_range_min,
          max: slider_range_max
        },
        step: 1,
        tooltips: false
      });
    };
  /* else, make sure sliders are in the right place: */
  } else {
      /* get current slider index: */
      var slider_current_index = parseInt(slider_div.noUiSlider.get());
      /* check slider index matches image index: */
      if (slider_current_index != image_index) {
        /* if not, adjust the slider: */
        slider_div.noUiSlider.set(image_index);
      };
      /* if licsar and probability display should be linked: */
      if (typeof(prob_data) !== 'undefined' && prob_data != null &&
          link_licsar_prob == true) {
        /* try to get the index of the date in other data: */
        var other_data_index = prob_data['dates'].indexOf(
          licsar_data['dates'][image_index]
        );
        /* if a result is found: */
        if (other_data_index > -1) {
          /* adjust the other data: */
          link_licsar_prob = false;
          display_prob_data(other_data_index);
          link_licsar_prob = true;
        };
      };
  };
};
