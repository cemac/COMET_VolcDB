
var prob_indexes_uncorrected = {};
var prob_indexes_corrected = {};
var prob_indexes = null;
var prob_plot_vars_uncorrected = null;
var prob_plot_vars_corrected = null;
var prob_plot_vars = null;


/* function to filter probability data.
   currently used to set 'bad' values to 'null': */
function filter_prob_data(prob_data) {
  /* means and maxes: */
  var means = prob_data['means'];
  var maxs = prob_data['maxs'];
  /* loop through values.: */
  for (var i = 0; i < means.length; i++) {
    /* if mean is 0.72 and max is 0.92, then this is a 'bad' value: */
    if (means[i] == 0.72 && maxs[i] == 0.92) {
      /* set values to 'null': */
      means[i] = 'null';
      maxs[i] = 'null';
    }
  };
  /* return the filtered / updated data: */
  return prob_data;
}

function init_prob_plot_vars(fid, call_back, call_back_args) {

  /* check if using corrected data: */
  var use_correct = false;
  if (use_correct != undefined && use_correct == true) {
    prob_plot_vars = prob_plot_vars_corrected;
  } else {
    prob_plot_vars = prob_plot_vars_uncorrected;
  };

  /* if main plot_vars is undefined: */
  if (prob_plot_vars == undefined) {
    /* init plotting variables: */
    prob_plot_vars = {
      /* html div elements: */
      'plot_div': document.getElementById('prob_plot'),
      /* min and max for probability: */
      'y_min': 0,
      'y_max': 1.0,
      /* probability plotting variables: */
      'index_color': '#ff9999',
      'max_color': '#f49d00',
      'mean_color': '#006db4'
    };
  };

  /* if plot variables for this frame are undefined: */
  if (prob_plot_vars[fid] == undefined) {
    /* set 'bad' values to 'null' in probability data: */
    prob_data = filter_prob_data(prob_data);
    prob_plot_vars[fid] = {
      /* values for plotting: */
      'indexes': prob_data['indexes'],
      'dates': prob_data['dates'],
      'means': prob_data['means'],
      'maxs': prob_data['maxs'],
      /* plots: */
      'plot': null,
      /* hover data: */
      'hover_data': null
    };
  };

  /* run call back function: */
  if (call_back && typeof(call_back) === "function") {
    call_back(call_back_args);
  };

};

function prob_plot(index) {

  /* variables: */
  var fid = volcano_frame;
  var indexes = prob_plot_vars[fid]['indexes'];
  var dates = prob_plot_vars[fid]['dates'];
  var means = prob_plot_vars[fid]['means'];
  var maxs = prob_plot_vars[fid]['maxs'];
  var plot = prob_plot_vars[fid]['plot'];
  var hover_data = prob_plot_vars[fid]['hover_data'];

  /* check if hover data needs to be created: */
  if (hover_data == null) {
    /* init hover data variable: */
    var hover_data = [];
    /* loop through indexes: */
    for (var i = 0; i < indexes.length; i++) {
      /* set the hover data: */
      hover_data[i] = 'index : ' + ('0000' + indexes[i]).slice(-4) + '<br>' +
                      'date  : ' + dates[i] + '<br>' +
                      'mean  : ' + means[i] + '<br>' +
                      'max  : ' + maxs[i];
    };
  }
  /* store the values: */
  prob_plot_vars[fid]['hover_data'] = hover_data;

  /* plotting variables: */
  var plot_div = prob_plot_vars['plot_div'];
  var index_color = prob_plot_vars['index_color'];
  var max_color = prob_plot_vars['max_color'];
  var mean_color = prob_plot_vars['mean_color'];
  var y_min = prob_plot_vars['y_min'];
  var y_max = prob_plot_vars['y_max'];

  /* x and yy values for index line plot: */
  var index_x = [index, index];
  var index_y = [y_min, y_max];

  /* scatter index location: */
  var scatter_index = {
    'name': 'index',
    'type': 'scatter',
    'mode': 'lines',
    'x': index_x,
    'y': index_y,
    'line': {
      'color': index_color
    },
    'hoverinfo': 'none',
    'showlegend': false
  };

  /* max probability plot: */
  var scatter_max = {
    'name': 'max',
    'type': 'scatter',
    'mode': 'markers',
    'x': indexes,
    'y': maxs,
    'marker': {
      'color': max_color,
      'size': 6,
    },
    'hoverinfo': 'text',
    'text': hover_data
  };

  /* mean probability plot: */
  var scatter_mean = {
    'name': 'mean',
    'type': 'scatter',
    'mode': 'markers',
    'x': indexes,
    'y': means,
    'marker': {
      'color': mean_color,
      'size': 6,
    },
    'hoverinfo': 'text',
    'text': hover_data
  };

  /* plot data, in order of plotting: */
  var scatter_data = [scatter_index, scatter_max, scatter_mean];

  /* plot update, if updating: */
  var scatter_update = {
    'x': [index_x, indexes, indexes],
    'y': [index_y, maxs, means],
  };

  /* scatter plot layout: */
  var scatter_layout = {
    'xaxis': {
      'title': 'index',
      'range': [0, indexes.length],
      'autorange': false,
      'zeroline': false
    },
    'yaxis': {
      'title': 'probability',
      'range': [y_min, y_max],
      'autorange': false,
      'zeroline': false
    },
    'margin': {
      'b': 40,
      't': 80
    },
    'hovermode': 'closest'
  };

  /* scatter plot config: */
  var scatter_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'toggleSpikelines',
      'select2d'
    ],
    'responsive': true
  };

  /* if plot does not exist: */
  if (plot == null) {
    /* create the scatter plot: */
    plot = Plotly.newPlot(plot_div, scatter_data,
                          scatter_layout, scatter_conf);
    /* store the plot information: */
    prob_plot_vars[fid]['plot'] = plot;
  } else {
    /* update the plot: */
    Plotly.update(plot_div, scatter_update, scatter_layout);
  };

};

function display_prob_data(index) {

  /* check if using uncorrected / corrected data and set variables
     accordingly: */
  var use_correct = false;
  if (use_correct != undefined && use_correct == true) {
    prob_indexes = prob_indexes_corrected;
  } else {
    prob_indexes = prob_indexes_uncorrected;
  };

  /* data index: */
  if ((index == undefined) ||
      (index == null)) {
    if (prob_indexes[volcano_frame] == undefined) {
      var image_index = prob_data['count'] - 1;
    } else {
      var image_index = prob_indexes[volcano_frame];
    };
  } else {
    var image_index = index;
  };
  prob_indexes[volcano_frame] = image_index;

  /* get image element: */
  var image_img = document.getElementById('prob_prob_img');

  /* get image label div: */
  var image_label_div = document.getElementById('prob_image_value');

  /* get image path: */
  var image_path = prob_img_prefix + prob_data['images'][image_index];

  /* get mean and max value: */
  var mean_value = prob_data['means'][image_index];
  if (mean_value != 'null') {
    mean_value = mean_value.toFixed(2);
  };
  var max_value = prob_data['maxs'][image_index];
  if (max_value != 'null') {
    max_value = max_value.toFixed(2);
  };

  /* get image label: */
  var image_label = '<label>' +  prob_data['dates'][image_index] + '</label>' +
                    ' (' + ('0000' + (image_index)).slice(-4) + ')<br>' +
                     'mean: ' + mean_value +
                     ', max: ' + max_value;

  /* set image: */
  image_img.src = image_path;

  /* set image label: */
  image_label_div.innerHTML = image_label;

  /* get image slider div: */
  var slider_div = document.getElementById('prob_image_control');

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
      /* add change listener: */
      slider_div.noUiSlider.on('change', function() {
        /* get slider value: */
        var slider_value = slider_div.noUiSlider.get();
        /* index to int: */
        var slider_index = parseInt(slider_value);
        /* label: */
        var slider_date = prob_data['dates'][slider_index];
        /* get mean and max value: */
        var mean_value = prob_data['means'][slider_index];
        if (mean_value != 'null') {
          mean_value = mean_value.toFixed(2);
        };
        var max_value = prob_data['maxs'][slider_index];
        if (max_value != 'null') {
          max_value = max_value.toFixed(2);
        };
        /* mean: */
        var slider_mean = mean_value;
        /* max: */
        var slider_max = max_value;
        /* update image: */
        display_prob_data(slider_index);
      });
      /* add slide listener: */
      slider_div.noUiSlider.on('slide', function() {
        /* get slider value: */
        var slider_value = slider_div.noUiSlider.get();
        /* index to int: */
        var slider_index = parseInt(slider_value);
        /* label: */
        var slider_date = prob_data['dates'][slider_index];
        /* get mean and max value: */
        var mean_value = prob_data['means'][slider_index];
        if (mean_value != 'null') {
          mean_value = mean_value.toFixed(2);
        };
        var max_value = prob_data['maxs'][slider_index];
        if (max_value != 'null') {
          max_value = max_value.toFixed(2);
        };
        /* mean: */
        var slider_mean = mean_value;
        /* max: */
        var slider_max = max_value;
        /* set labels: */
        image_label_div.innerHTML = (
          '<label>' + slider_date + '</label>' +
          ' (' + ('0000' + (slider_index + 1)).slice(-4)) + ')<br>' +
          'mean: ' +
          slider_mean +
          ', max: ' +
          slider_max +
          '</label>';
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
      if (typeof(licsar_data) !== 'undefined' && licsar_data != null &&
          link_licsar_prob == true) {
        /* try to get the index of the date in other data: */
        var other_data_index = licsar_data['dates'].indexOf(
          prob_data['dates'][image_index]
        );
        /* if a result is found: */
        if (other_data_index > -1) {
          /* adjust the other data avoiding infinite loops: */
          link_licsar_prob = false;
          init_licsar_images(other_data_index);
          link_licsar_prob = true;
        };
      };
  };

  /* probability plotting ... */

  /* init plot variables: */
  init_prob_plot_vars(volcano_frame, prob_plot, image_index);

};
