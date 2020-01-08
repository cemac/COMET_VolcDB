
var page_update = false;

var volcano_frame_index = null;
var volcano_frame = null;
var volcano_track = null;
var disp_data = null;
var licsar_data = null;
var prob_data = null;

/* page set up function: */
function s1_page_set_up(frame_index) {

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

  /* page is updating: */
  page_update = true;

  /* update buttons: */
  var frame_id_control = document.getElementById('frame_id_control');
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
      /* set prob_data variable: */
      prob_data = prob_req.response;
      /* set image prefix variable: */
      prob_img_prefix = prob_imgs_prefix + volcano_region + '/' + volcano_name + '_' + volcano_frame + '/';
      /* display: */
      display_prob_image();
      /* page is updated: */
      page_update = false;
    };
    /* send the request: */
    prob_req.send(null);
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
      /* set licsar_data variable: */
      licsar_data = licsar_req.response;
      /* set image prefix variable: */
      licsar_img_prefix = licsar_imgs_prefix + volcano_region + '/' + volcano_name + '_' + volcano_frame + '/';
      /* display: */
      display_licsar_images();
      /* then update probability data: */
      prob_update();
    };
    /* send the request: */
    licsar_req.send(null);
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
    /* set disp_data variable: */
    disp_data = disp_req.response;
    /* set plot variables for the frame: */
    set_plot_vars(volcano_frame);
    /* displacement plot: */
    disp_plot();
    /* then update licsar data: */
    licsar_update();
  };
  /* send the request: */
  disp_req.send(null);

};

/* on page load: */
window.addEventListener('load', function() {
  /* set up the page: */
  s1_page_set_up();
});
