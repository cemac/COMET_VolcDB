
var page_update = false;

var volcano_frame_index = null;
var volcano_frame = null;
var volcano_track = null;

var frame_has_disp_correct = null;
var frame_has_licsar_correct = null;
var frame_use_disp_correct = null;

var disp_data = null;
var licsar_data = null;
var licsar_data_gacos = null;

var licsar_img_prefix = null;
var licsar_img_gacos_prefix = null;

var link_licsar_prob = true;

var s1_frame_el_display = null;
var disp_correct_el_display = null;
var s1_type_el_display = null;
var licsar_img_el_display = null;
var licsar_range_el_display = null;
var data_down_el_display = null;
var prob_data_el_display = null;
var prob_range_el_display = null;
var disp_plot_el_display = null;
var disp_range_el_display = null;

/*
 * function to get GET variables
 * see: https://stackoverflow.com/a/12049737
 */
function get_get_vars() {
 /* init _GET variable: */
 var get_vars = {};
 /* check for any URL parameters: */
 if (document.location.toString().indexOf('?') !== -1) {
   /* extract URL parameters: */
   var doc_url = document.location.toString()
   var url_pars = doc_url.replace(/^.*?\?/, '').replace(/#.*$/, '').split('&');
   /* loop through parameters, and add to _GET: */
   for(var i = 0; i < url_pars.length; i++) {
     var url_par = decodeURIComponent(url_pars[i]).split('=');
     get_vars[url_par[0]] = url_par[1];
   };
 };
 /* return the GET variables: */
 return get_vars;
};

/* return the nearest value from an array: */
function get_nearest_value(val, arr) {
  /* init min diff variable: */
  var min_diff = 999999999;
  /* return value: */
  var index;
  /* loop through array: */
  for (var i = 0; i < arr.length; i++) {
    /* get the difference: */
    var diff = Math.abs(val - arr[i]);
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

/* function to enable / disable display of correction type buttons: */
function enable_correct(enable_data, html_element, html_display) {
  /* if this frame does not have corrected data, set use_correct to false: */
  if (enable_data == false) {
    html_element.style.display = 'none';
  } else {
    html_element.style.display = html_display;
  };
};

/* function to check if correction data exists: */
function check_correct_data(data_url, has_correct, html_element, html_display) {
  /* create new request: */
  var disp_req = new XMLHttpRequest();
  disp_req.responseType = 'json';
  disp_req.open('HEAD', data_url, true);
  /* on data download: */
  disp_req.onload = function() {
    /* if not successful: */
    if (disp_req.status != 200) {
      /* set has_correct to false: */
      has_correct[volcano_frame_index] = false;
      /* disable buttons: */
      if (html_element != undefined) {
        enable_correct(false, html_element, html_display);
      };
    } else {
      /* set has_correct to true: */
      has_correct[volcano_frame_index] = true;
      /* enable buttons: */
      if (html_element != undefined) {
        enable_correct(true, html_element, html_display);
      };
    };
  };
  /* if data check fails: */
  disp_req.onerror = function() {
    /* set has_correct to false: */
    has_correct[volcano_frame_index] = false;
    /* disable buttons: */
    if (html_element != undefined) {
      enable_correct(false, html_element, html_display);
    };
  };
  /* send the request: */
  disp_req.send(null);
};

/* page set up function: */
function s1_page_set_up(frame_index, use_disp_correct) {

  /* set up data correct variables for storing if corrected data is availble
     and in use for each frame: */
  if (frame_has_disp_correct == undefined) {
    frame_has_disp_correct = [];
    for (var i = 0; i < volcano_frames.length; i++) {
      frame_has_disp_correct.push(null);
    };
  };
  if (frame_has_licsar_correct == undefined) {
    frame_has_licsar_correct = [];
    for (var i = 0; i < volcano_frames.length; i++) {
      frame_has_licsar_correct.push(null);
    };
  };
  if (frame_use_disp_correct == undefined) {
    frame_use_disp_correct = [];
    for (var i = 0; i < volcano_frames.length; i++) {
      frame_use_disp_correct.push(false);
    };
  };
  /* html elements of interest: */
  var s1_frame_el = document.getElementById('row_s1_frame');
  var disp_correct_el = document.getElementById('row_disp_correct');
  var s1_type_el = document.getElementById('row_s1_type');
  var licsar_img_el = document.getElementById('row_licsar_images');
  var licsar_range_el = document.getElementById('row_licsar_img_range');
  var data_down_el = document.getElementById('row_data_downloads');
  var prob_data_el = document.getElementById('row_prob_data');
  var prob_range_el = document.getElementById('row_prob_range');
  var disp_plot_el = document.getElementById('row_disp_plot');
  var disp_range_el = document.getElementById('row_disp_range');
  /* error elements: */
  var licsar_error_el = document.getElementById('no_licsar_error');
  var prob_error_el = document.getElementById('no_prob_error');
  var disp_error_el = document.getElementById('no_disp_error');

  /* get display style of element: */
  s1_frame_el_display == (s1_frame_el_display === null) ?
    s1_frame_el.style.display : s1_frame_el_display;
  disp_correct_el_display == (disp_correct_el_display === null) ?
    disp_correct_el.style.display : disp_correct_el_display;
  s1_type_el_display == (s1_type_el_display === null) ?
    s1_type_el.style.display : s1_type_el_display;
  licsar_img_el_display == (licsar_img_el_display === null) ?
    licsar_img_el.style.display : licsar_img_el_display;
  licsar_range_el_display == (licsar_range_el_display === null) ?
    licsar_range_el.style.display : licsar_range_el_display;
  data_down_el_display == (data_down_el_display === null) ?
    data_down_el.style.display : data_down_el_display;
  prob_data_el_display == (prob_data_el_display === null) ?
    prob_data_el.style.display : prob_data_el_display;
  prob_range_el_display == (prob_range_el_display === null) ?
    prob_range_el.style.display : prob_range_el_display;
  disp_plot_el_display == (disp_plot_el_display === null) ?
    disp_plot_el.style.display : disp_plot_el_display;
  disp_range_el_display == (disp_range_el_display === null) ?
    disp_range_el.style.display : disp_range_el_display;

  /* if frame index is undefined: */
  if (frame_index == undefined) {
    /* if global frame var is also unset: */
    if (volcano_frame == null) {
      /* check for frame id in URL parameters: */
      get_vars = get_get_vars();
      var get_frame_id = get_vars['frame'];
      /* check if frame id from url is valid: */
      for (var i = 0; i < volcano_frames.length; i++) {
        if (volcano_frames[i]['id'] == get_frame_id) {
          frame_index = i;
        };
      };
    };
  };

  /* check if frame index is set: */
  if (frame_index == undefined) {
    /* if global frame var is also unset: */
    if (volcano_frame == null) {
      /* use first frame: */
      volcano_frame_index = 0;
      volcano_frame = volcano_frames[0]['id'];
      volcano_track = volcano_frames[0]['track'];
    };
  } else {
    /* if frame index hasn't changed, return: */
    if (frame_index == volcano_frame_index &&
        frame_use_disp_correct[frame_index] == use_disp_correct) {
      return;
    }
    /* otherwise, use specified frame: */
    volcano_frame_index = frame_index;
    volcano_frame = volcano_frames[frame_index]['id'];
    volcano_track = volcano_frames[frame_index]['track'];
  };

  /* check for no frames: */
  if (volcano_frames.length == 1 &&
      volcano_frames[0]['id'] == '') {
    /* hide frame selection element: */
    s1_frame_el.style.display = 'none';
  } else {
    /* show frame selection element: */
    s1_frame_el.style.display = s1_frame_el_display;
  };

  /* check if this frame has corrected data available. check for licsar
     data: */
  if (frame_has_licsar_correct[frame_index] != true) {
    var licsar_data_url = js_data_prefix + licsar_data_gacos_prefix +
                        volcano_region + '/' + volcano_name + '_' +
                        volcano_frame + '.json';
    check_correct_data(licsar_data_url, frame_has_licsar_correct);
  };

  /* check for displacement data: */
  if (frame_has_disp_correct[frame_index] != true) {
    var disp_data_url = js_data_prefix + disp_data_gacos_prefix +
                        volcano_region + '/' + volcano_name + '_' +
                        volcano_frame + '.json';
    check_correct_data(disp_data_url, frame_has_disp_correct,
                       disp_correct_el, disp_correct_el_display);
  };

  /* check for undefined use_disp_correct: */
  if (use_disp_correct == undefined) {
    use_disp_correct = frame_use_disp_correct[frame_index];
  };
  /* store use_correct value: */
  frame_use_disp_correct[volcano_frame_index] = use_disp_correct;

  /* check if using corrected disp data: */
  var button_disp_uncorrected = document.getElementById('disp_select_button_uncorrected');
  var button_disp_corrected = document.getElementById('disp_select_button_corrected');
  if (use_disp_correct == true) {
    /* data prefixes: */
    var my_disp_data_prefix = disp_data_gacos_prefix;
    button_disp_corrected.setAttribute('disabled', true);
    button_disp_uncorrected.removeAttribute('disabled');
  } else {
    /* data prefixes: */
    var my_disp_data_prefix = disp_data_prefix;
    button_disp_corrected.removeAttribute('disabled');
    button_disp_uncorrected.setAttribute('disabled', true);
  };

  /* page is updating: */
  page_update = true;

  /* update buttons: */
  var frame_id_control = document.getElementById('s1_frame_control');
  /* clear html content: */
  frame_id_control.innerHTML = '';
  /* loop through frames: */
  for (var i = 0; i < volcano_frames.length; i++) {
    /* add button: */
    frame_html = '<button onclick="s1_page_set_up(' + i + ');"';
    if (i == volcano_frame_index) {
      frame_html = frame_html + ' disabled="true"';
    };
    frame_html = frame_html + '>' + volcano_frames[i]['id'] + '</button>\n';
    frame_id_control.innerHTML += frame_html;
  };

  /* probability data load error function: */
  function prob_req_error() {
    /* hide s1 img html elements are visible: */
    prob_data_el.style.display = 'none';
    prob_range_el.style.display = 'none';
    /* display error element: */
    prob_error_el.style.display = 'inline';
  };

  function prob_update() {
    /* get prob data: */
    var prob_data_url = js_data_prefix + prob_data_prefix +
                        volcano_region + '/' + volcano_name + '_' +
                        volcano_frame + '.json';
    /* create new request: */
    var prob_req = new XMLHttpRequest();
    prob_req.responseType = 'json';
    prob_req.open('GET', prob_data_url, true);
    /* on data download: */
    prob_req.onload = function() {
      /* if not successful: */
      if (prob_req.status != 200) {
        prob_req_error();
      } else {
        /* set prob_data variable: */
        prob_data = prob_req.response;
        /* set image prefix variable: */
        prob_img_prefix = prob_imgs_prefix + volcano_region + '/' + volcano_name + '_' + volcano_frame + '/';
        /* hide error element: */
        prob_error_el.style.display = 'none';
        /* make sure html elements are visible: */
        prob_data_el.style.display = prob_data_el_display;
        prob_range_el.style.display = prob_range_el_display;
        /* display probability data, if any: */
        if (prob_data['count'] < 1) {
          prob_req_error();
        } else {
          display_prob_data();
        };
        /* page is updated: */
        page_update = false;
      };
    };
    /* if probability data load fails: */
    prob_req.onerror = function() {
      prob_req_error();
      /* page is updated: */
      page_update = false;
    };
    /* send the request: */
    prob_req.send(null);
  };

  /* licsar data load error function: */
  function licsar_req_error() {
    /* hide licsar img html elements are visible: */
    licsar_img_el.style.display = 'none';
    licsar_range_el.style.display = 'none';
    data_down_el.style.display = 'none';
    /* display error element: */
    licsar_error_el.style.display = 'inline';
    /* update probability: */
    prob_update();
  };

  function licsar_update() {
    /* get licsar data: */
    var licsar_data_url = js_data_prefix + licsar_data_prefix +
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
        licsar_req_error();
      } else {
        /* set licsar_data variable: */
        licsar_data = licsar_req.response;
        /* set image prefix variable: */
        licsar_img_prefix = licsar_imgs_prefix + volcano_region + '/' + volcano_name + '_' + volcano_frame + '/';
        /* hide error element: */
        licsar_error_el.style.display = 'none';
        /* make sure html elements are visible: */
        licsar_img_el.style.display = licsar_img_el_display;
        licsar_range_el.style.display = licsar_range_el_display;
        data_down_el.style.display = data_down_el_display;
        /* display images, if any: */
        if (licsar_data['count'] < 1) {
          licsar_req_error();
        } else {
          init_licsar_images();
          prob_update();
        };
      };
    };
    /* if licsar data retrival fails: */
    licsar_req.onerror = function() {
      licsar_req_error();
    };
    /* send the request: */
    licsar_req.send(null);
  };

  /* displacement data load error function: */
  function disp_req_error() {
    /* hide displacement plotting elements: */
    s1_type_el.style.display = 'none';
    disp_plot_el.style.display = 'none';
    disp_range_el.style.display = 'none';
    /* display error element: */
    disp_error_el.style.display = 'inline';
    /* update licsar: */
    licsar_update();
  };

  /* get displacement data: */
  var disp_data_url = js_data_prefix + my_disp_data_prefix +
                      volcano_region + '/' + volcano_name + '_' +
                      volcano_frame + '.json';
  /* create new request: */
  var disp_req = new XMLHttpRequest();
  disp_req.responseType = 'json';
  disp_req.open('GET', disp_data_url, true);
  /* on data download: */
  disp_req.onload = function() {
    /* if not successful: */
    if (disp_req.status != 200) {
      disp_req_error();
    } else {
      /* set disp_data variable: */
      disp_data = disp_req.response;
      /* hide error element: */
      disp_error_el.style.display = 'none';
      /* make sure displacement elements are visible: */
      s1_type_el.style.display = s1_type_el_display;
      disp_plot_el.style.display = disp_plot_el_display;
      disp_range_el.style.display = disp_range_el_display;
      /* set plot variables for the frame, then run displacement plotting
         function: */
      init_plot_vars(volcano_frame, disp_plot);
      /* then update licsar data: */
      licsar_update();
    };
  };
  /* if displacement data retrival fails: */
  disp_req.onerror = function() {
    disp_req_error();
  };
  /* send the request: */
  disp_req.send(null);

};

/* on page load: */
window.addEventListener('load', function() {
  /* set up the page: */
  s1_page_set_up();
});
