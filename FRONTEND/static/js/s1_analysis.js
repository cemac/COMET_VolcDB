
var page_update = false;

var volcano_frame_index = null;
var volcano_frame = null;
var volcano_track = null;
var disp_data = null;
var licsar_data = null;
var prob_data = null;

var disp_plot_el_display = null;
var disp_range_el_display = null;
var disp_hr_el_display = null;
var s1_frame_el_display = null;
var s1_img_el_display = null;
var s1_range_el_display = null;
var data_down_el_display = null;

/* page set up function: */
function s1_page_set_up(frame_index) {

  /* html elements of interest: */
  var s1_frame_el = document.getElementById('row_s1_frame');
  var s1_img_el = document.getElementById('row_s1_images');
  var s1_range_el = document.getElementById('row_s1_img_range');
  var data_down_el = document.getElementById('row_data_downloads');
  var disp_plot_el = document.getElementById('row_disp_plot');
  var disp_range_el = document.getElementById('row_disp_range');
  var disp_hr_el = document.getElementById('hr_disp_plot');
  /* error elements: */
  var s1_error_el = document.getElementById('no_s1_error');
  var disp_error_el = document.getElementById('no_disp_error');

  /* get display style of element: */
  s1_frame_el_display == (s1_frame_el_display === null) ?
    s1_frame_el.style.display : s1_frame_el_display;
  s1_img_el_display == (s1_img_el_display === null) ?
    s1_img_el.style.display : s1_img_el_display;
  s1_range_el_display == (s1_range_el_display === null) ?
    s1_range_el.style.display : s1_range_el_display;
  data_down_el_display == (data_down_el_display === null) ?
    data_down_el.style.display : data_down_el_display;
  disp_plot_el_display == (disp_plot_el_display === null) ?
    disp_plot_el.style.display : disp_plot_el_display;
  disp_range_el_display == (disp_range_el_display === null) ?
    disp_range_el.style.display : disp_range_el_display;
  disp_hr_el_display == (disp_hr_el_display === null) ?
    disp_hr_el.style.display : disp_hr_el_display;

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
    if (frame_index == volcano_frame_index) {
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
    frame_html = frame_html + '>' + volcano_frames[i]['id'] + '</button>';
    frame_id_control.innerHTML += frame_html;
  };

  /* probability data load error function: */
  function prob_req_error() {
    /* hide s1 img html elements are visible: */
    s1_img_el.style.display = 'none';
    s1_range_el.style.display = 'none';
    data_down_el.style.display = 'none';
    /* display error element: */
    s1_error_el.style.display = 'inline';
  };

  function prob_update() {
    /* get prob data: */
    var prob_data_url = js_data_prefix + prob_data_prefix + '/' +
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
        s1_error_el.style.display = 'none';
        /* make sure html elements are visible: */
        s1_img_el.style.display = s1_img_el_display;
        s1_range_el.style.display = s1_range_el_display;
        data_down_el.style.display = data_down_el_display;
        /* display images: */
        display_licsar_images();
        display_prob_image();
        /* page is updated: */
        page_update = false;
      };
    };
    /* if probability data load fails: */
    prob_req.onerror = function() {
      prob_req_error();
    };
    /* send the request: */
    prob_req.send(null);
  };

  /* licsar data load error function: */
  function licsar_req_error() {
    /* hide s1 img html elements are visible: */
    s1_img_el.style.display = 'none';
    s1_range_el.style.display = 'none';
    data_down_el.style.display = 'none';
    /* display error element: */
    s1_error_el.style.display = 'inline';
  };

  function licsar_update() {
    /* get licsar data: */
    var licsar_data_url = js_data_prefix + licsar_data_prefix + '/' +
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
        s1_error_el.style.display = 'none';
        /* make sure html elements are visible: */
        s1_img_el.style.display = s1_img_el_display;
        s1_range_el.style.display = s1_range_el_display;
        data_down_el.style.display = data_down_el_display;
        /* display error element: */
        s1_error_el.style.display = 'inline';
        /* then update probability data: */
        prob_update();
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
    disp_plot_el.style.display = 'none';
    disp_range_el.style.display = 'none';
    disp_hr_el.style.display = 'none';
    /* display error element: */
    disp_error_el.style.display = 'inline';
    /* update licsar: */
    licsar_update();
  };

  /* get displacement data: */
  var disp_data_url = js_data_prefix + disp_data_prefix + '/' +
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
      disp_plot_el.style.display = disp_plot_el_display;
      disp_range_el.style.display = disp_range_el_display;
      disp_hr_el.style.display = disp_hr_el_display;
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
