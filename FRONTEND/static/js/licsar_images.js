
var licsar_indexes_uncorrected = {};
var licsar_indexes_corrected = {};
var licsar_dates_corrected = {};
var licsar_indexes = null;

function init_licsar_images(index) {

  /* function to enable / disable gacos data display: */
  function enable_licsar_gacos(data_elements, data_enabled) {
    /* hide elements if no data: */
    if (data_enabled == true) {
      for (var i = 0; i < data_elements.length; i++) {
        data_elements[i].style.display = 'inline';
      };
    } else {
      for (var i = 0; i < data_elements.length; i++) {
        data_elements[i].style.display = 'none';
      };
    };
  };

  /* function to get corrected data exists: */
  function get_licsar_gacos_data(html_elements) {
    /* get licsar data: */
    var licsar_data_url = js_data_prefix + licsar_data_gacos_prefix +
                        volcano_region + '/' + volcano_name + '_' +
                        volcano_frame + '.json';
    /* create new request: */
    var licsar_req = new XMLHttpRequest();
    licsar_req.responseType = 'json';
    licsar_req.open('GET', licsar_data_url, true);
    /* on data download: */
    licsar_req.onload = function() {
      /* if not successful: */
      if (licsar_req.status != 200) {
        enable_licsar_gacos(html_elements, false);
      } else {
        /* set licsar_data variable: */
        licsar_data_gacos = licsar_req.response;
        /* set image prefix variable: */
        licsar_img_gacos_prefix = licsar_imgs_gacos_prefix + volcano_region + '/' + volcano_name + '_' + volcano_frame + '/';
        /* if no images, hide html elements: */
        if (licsar_data['count'] < 1) {
          frame_has_licsar_correct[volcano_frame_index] = false;
          enable_licsar_gacos(html_elements, false);
        /* else, enable html elements: */
        } else {
          enable_licsar_gacos(html_elements, true);
        };
        /* display images: */
        display_licsar_images(index);
      };
    };
    /* if licsar data retrival fails: */
    licsar_req.onerror = function() {
      enable_licsar_gacos(html_elements, false);
      display_licsar_images(index);
    };
    /* send the request: */
    licsar_req.send(null);
  };

  /* gacos html elements: */
  var licsar_gacos_hdr_el = document.getElementById('licsar_gacos_hdr');
  var licsar_gacos_imgs_el = document.getElementById('licsar_gacos_imgs');
  /* check if this frame has corrrected data and get it if so: */
  if (frame_has_licsar_correct[volcano_frame_index] == true) {
    get_licsar_gacos_data([licsar_gacos_hdr_el, licsar_gacos_imgs_el]);
  } else {
    enable_licsar_gacos([licsar_gacos_hdr_el, licsar_gacos_imgs_el], false);
    display_licsar_images(index);
  };

};

function display_licsar_images(index) {

  /* return the nearest dates from an array: */
  function get_nearest_dates(val, arr) {
    /* init min diff variable: */
    var min_diff = 999999999;
    /* return value: */
    var index;
    /* convert value to numeric: */
    val = parseInt(val.replace(/-/g, ''))
    /* loop through array: */
    for (var i = 0; i < arr.length; i++) {
      /* other value as integer: */
      var other_val = parseInt(arr[i].replace(/-/g, ''))
      /* get the difference: */
      var diff = Math.abs(val - other_val);
      /* if less than current min: */
      if (diff < min_diff) {
        /* update min_diff and index variables: */
        min_diff = diff;
        index = i;
      };
    };
    /* return the index of nearest value: */
    return index;
  };

  /* set licsar indexes to point to uncorrected values: */
  licsar_indexes = licsar_indexes_uncorrected;

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

  /* try to get the indexes of the dates in gacos data: */
  if (frame_has_licsar_correct[volcano_frame_index] == true) {
    /* if not already defined: */
    if (licsar_dates_corrected[volcano_frame_index] == undefined) {
      licsar_dates_corrected[volcano_frame_index] = {};
      licsar_dates_corrected[volcano_frame_index]['dates'] = [];
      licsar_dates_corrected[volcano_frame_index]['indexes'] = [];
      for (var i = 0; i < licsar_data['dates'].length; i++) {
        var image_gacos_index = licsar_data_gacos['dates'].indexOf(
          licsar_data['dates'][i]
        );
        /* if a result is not found: */
        if (image_gacos_index < 0) {
          /* try and find the nearest value: */
          image_gacos_index = get_nearest_dates(
            licsar_data['dates'][i],
            licsar_data_gacos['dates']
          );
        };
        /* store the date and index: */
        licsar_dates_corrected[volcano_frame_index]['dates'][i] = (
          licsar_data_gacos['dates'][image_gacos_index]
        );
        licsar_dates_corrected[volcano_frame_index]['indexes'][i] = image_gacos_index;
      };
    };
  };

  /* get image elements: */
  var if_img = document.getElementById('licsar_if_img');
  var if_gacos_img = document.getElementById('licsar_if_gacos_img');

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

  /* set gacos image, if available: */
  if (frame_has_licsar_correct[volcano_frame_index] == true) {
    /* get / set index: */
    licsar_indexes_corrected[volcano_frame] = (
      licsar_dates_corrected[volcano_frame_index]['indexes'][image_index]
    );
    var image_gacos_index = licsar_indexes_corrected[volcano_frame];
    /* get image paths: */
    var image_gacos_path = licsar_data_gacos['images'][image_gacos_index];
    /* get image label: */
    var image_gacos_label = licsar_data_gacos['dates'][image_gacos_index];
    /* set images: */
    if_gacos_img.src = licsar_img_gacos_prefix + image_gacos_path;
    /* update image label: */
    image_label = image_label + ' (' + image_gacos_label + ')';
  };

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
        if (frame_has_licsar_correct[volcano_frame_index] == true) {
          var slider_gacos_date = licsar_dates_corrected[volcano_frame_index]['dates'][slider_index];
          slider_date = slider_date + ' (' + slider_gacos_date + ')';
        };
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
