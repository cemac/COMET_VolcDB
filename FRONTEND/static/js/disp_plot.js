/** variables: **/

var plot_vars = null;

/* function to init plot variables: */
function init_plot_vars(fid) {
  if (plot_vars == undefined) {
    /* init plotting variables: */
    plot_vars = {
      /* default heatmap type: */
      'heatmap_type': 'disp',
      /* default scatter type: */
      'scatter_type': 'ts',
      /* html div elements: */
      'heatmap_div': document.getElementById('heatmap_plot'),
      'surf_div': document.getElementById('surf_plot'),
      'scatter_div': document.getElementById('scatter_plot'),
      'slider_div': document.getElementById('time_range_control'),
      'slider_value_div': document.getElementById('time_range_value'),
      /* html button elements: */
      'button_disp': document.getElementById('heatmap_type_button_disp'),
      'button_coh': document.getElementById('heatmap_type_button_coh'),
      'button_ts': document.getElementById('scatter_type_button_ts'),
      'button_profile': document.getElementById('scatter_type_button_profile'),
      'button_select': document.getElementById('click_mode_button_select'),
      'button_ref': document.getElementById('click_mode_button_ref'),
      /* min and max for coherence heatmap: */
      'heatmap_coh_z_min': 0,
      'heatmap_coh_z_max': 1.0,
      /* heatmap plotting variables: */
      'heatmap_disp_title': 'displacement (mm)',
      'heatmap_disp_colorscale' : [
        [0, 'rgb(26, 51, 153)'],
        [0.25, 'rgb(72, 152, 197)'],
        [0.5, 'rgb(204, 235, 200)'],
        [0.75, 'rgb(192, 159, 58)'],
        [1, 'rgb(127, 25, 0)']
      ],
      'heatmap_coh_title': 'coherence',
      'heatmap_coh_colorscale': 'Greys',
      /* scatter plotting variables: */
      'scatter_ts_mode': 'markers',
      'scatter_ts_x_title': 'date',
      'scatter_profile_mode': 'lines',
      'scatter_profile_title': 'displacement profile',
      'scatter_profile_title': 'distance (km)',
      /* inital hover variables: */
      'hover': false,
      'hover_x': false,
      'hover_y': false
    };
  };
  /* set plot variables for this frame: */
  set_plot_vars(fid);
};

/* function to init plot variables for this frame: */
function set_plot_vars(fid) {
  if (plot_vars[fid] == undefined) {
    plot_vars[fid] = {
      /* heatmap type (displacement or coherence): */
      'heatmap_type': null,
      /* scatter plot type (time series or profile): */
      'scatter_type': null,
      /* start and end index for time range: */
      'start_index': null,
      'end_index': null,
      /* time series area: */
      'ts_area': null,
      /* time series x and y values for plotting: */
      'ts_x': null,
      'ts_y': null,
      /* profile area: */
      'profile_area': null,
      /* reference area: */
      'ref_area': null,
      /* reference area x and y values for plotting: */
      'ref_x': null,
      'ref_y': null,
      /* current heatmap displacement data: */
      'heatmap_disp': null,
      'heatmap_disp_masked': null,
      'heatmap_hover': null,
      'heatmap_disp_z_min': null,
      'heatmap_disp_z_max': null,
      /* current time series data: */
      'ts_disp': null,
      'ts_dates': null,
      'ts_hover': null,
      /* current time series title: */
      'ts_title': null,
      /* current profile data: */
      'profile_disp': null,
      'profile_dist': null,
      'profile_hover': null,
      'profile_x': null,
      'profile_y': null,
      /* x and y indexes: */
      'x_indexes': null,
      'y_indexes': null,
      /* current selected x and y values: */
      'selected_x': null,
      'selected_y': null,
      /* plots: */
      'heatmap_plot': null,
      'surf_plot': null,
      'scatter_plot': null,
      /* data variables ... x and y values: */
      'x': disp_data['x'],
      'y': disp_data['y'],
      /* x and y distance values: */
      'x_dist': disp_data['x_dist'],
      'y_dist': disp_data['y_dist'],
      /* date values: */
      'dates': disp_data['dates'],
      /* displacement data: */
      'disp': disp_data['data_raw'],
      /* coherence data: */
      'coh': disp_data['coh'],
      /* mask data: */
      'mask': disp_data['mask'],
      /* reference area: */
      'refarea': disp_data['refarea'],
    };
  };
};


/** helper functions: **/


/* function to set the click mode to either 'select' (selected pixel) or
   'ref' (reference area): */
function set_click_mode(click_mode) {
  /* volcano frame id: */
  var fid = volcano_frame;
  /* if click mode is 'ref': */
  if (click_mode == 'ref') {
    /* disable button for active click mode: */
    plot_vars['button_ref'].setAttribute('disabled', true);
    plot_vars['button_select'].removeAttribute('disabled');
    /* store the click mode value: */
    plot_vars[fid]['click_mode'] = 'ref';
  } else {
    /* click mode is 'select' ...
       disable button for active click mode: */
    plot_vars['button_select'].setAttribute('disabled', true);
    plot_vars['button_ref'].removeAttribute('disabled');
    /* store the click mode value: */
    plot_vars[fid]['click_mode'] = 'select';
  };
  /* make sure dragmode is set to 'select': */
  if (plot_vars['heatmap_div'].data != undefined) {
    Plotly.update(plot_vars['heatmap_div'], {}, {dragmode: 'select'});
  };
};

/* function to save scatter plot data as csv file: */
function scatter_to_csv() {
  /* volcano frame id: */
  var fid = volcano_frame;
  /* check scatter plot type, if time series: */
  if (plot_vars[fid]['scatter_type'] == 'ts') {
    /* start csv content: */
    var csv_data = 'data:text/csv;charset=utf-8,';
    /* header line: */
    csv_data += 'date,displacement (mm)\r\n';
    /* get dates in current range: */
    var csv_x = plot_vars[fid]['dates'].slice(plot_vars[fid]['start_index'],
                                              plot_vars[fid]['end_index'] + 1);
    /* get displacement values: */
    var csv_y = plot_vars[fid]['ts_disp'];
  } else {
    /* profile plot ... start csv content: */
    var csv_data = 'data:text/csv;charset=utf-8,';
    /* header line: */
    csv_data += 'distance (km),displacement (mm)\r\n';
    /* get profile distances: */
    var csv_x = plot_vars[fid]['profile_dist'];
    /* get profile displacements: */
    var csv_y = plot_vars[fid]['profile_disp'];
  };
  /* loop through values: */
  for (var i = 0; i < csv_x.length - 1; i++) {
    /* add line to csv: */
    csv_data += csv_x[i] + ',' +  parseFloat(csv_y[i]).toFixed(2) + '\r\n';
  };
  /* encode csv data: */
  var encoded_uri = encodeURI(csv_data);
  /* name for csv file: */
  var csv_name = volcano_name + '_' + fid + '_' +
                 plot_vars[fid]['scatter_type'] + '.csv';
  /* create a temporary link element: */
  var csv_link = document.createElement("a");
  csv_link.setAttribute("href", encoded_uri);
  csv_link.setAttribute("download", csv_name);
  csv_link.style.visibility = 'hidden';
  /* add link to document, click to init download, then remove: */
  document.body.appendChild(csv_link);
  csv_link.click();
  document.body.removeChild(csv_link);
};

/* function to pick initial indexes for time series, which is not
   masked, and is near the center: */
function get_ts_indexes() {
  /* volcano frame id: */
  var fid = volcano_frame;
  /* get x and y midpoint indexes: */
  var mid_y = Math.floor(plot_vars[fid]['y'].length / 2) - 1;
  var mid_x = Math.floor(plot_vars[fid]['x'].length / 2) - 1;
  /* find the first value near center which is not masked: */
  for (var i = mid_y; i < plot_vars[fid]['mask'].length; i ++) {
    for (var j = mid_x; j < plot_vars[fid]['mask'].length; j ++) {
      if (plot_vars[fid]['mask'][i][j] == 1) {
        return[i, j];
      };
    };
  };
};

/* return the nearest value from an array: */
function get_nearest_value(val, arr) {
  /* init min diff variable: */
  var min_diff = 999999999;
  /* return value: */
  var index;
  /* loop through array: */
  for (var i = 0; i < arr.length - 1; i++) {
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

/* function to get mean value of specified area in a set of data: */
function get_area_mean(var_area, var_data) {
  /* init mean calculating variables: */
  var var_sum = 0;
  var var_count = 0;
  var var_mean;
  /* loop through var values, adding to sum if value is good: */
  for (var i = var_area[0]; i < var_area[1]; i++) {
    for (var j = var_area[2]; j < var_area[3]; j++) {
      if (var_data[i][j] != 'null') {
        var_sum += var_data[i][j];
        var_count += 1;
      };
    };
  };
  /* calculate mean, or return 0 if no values: */
  if (var_count > 0) {
    var_mean = var_sum / var_count;
  } else {
    var_mean = 0;
  };
  return var_mean;
};

/*
   haversine distance calculation.
   this implementation borrowed entirely from here:
     https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript#38549345
 */
function get_distance(coord_a, coord_b) {
  function toRad(x) {
    return x * Math.PI / 180;
  };
  var diff_lat = toRad(coord_b.latitude - coord_a.latitude);
  var diff_lon = toRad(coord_b.longitude - coord_a.longitude)
  var a = Math.sin(diff_lat / 2) * Math.sin(diff_lat / 2) +
          Math.cos(toRad(coord_a.latitude)) *
          Math.cos(toRad(coord_b.latitude)) *
          Math.sin(diff_lon / 2) * Math.sin(diff_lon / 2);
  return 12742 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


/** main plotting function: **/


/* main displacement data plotting function: */
function disp_plot(heatmap_type, scatter_type,
                   start_index, end_index,
                   ts_area, profile_area, ref_area) {


  /** displacement data values: */


  var fid = volcano_frame;
  var x = plot_vars[fid]['x'];
  var y = plot_vars[fid]['y'];
  var x_dist = plot_vars[fid]['x_dist'];
  var y_dist = plot_vars[fid]['y_dist'];
  var dates = plot_vars[fid]['dates'];
  var disp = plot_vars[fid]['disp'];
  var coh = plot_vars[fid]['coh'];
  var mask = plot_vars[fid]['mask'];
  var refarea = plot_vars[fid]['refarea'];


  /** get input values: **/


  /* presume nothing to be updated: */
  var update_heatmap_type = false;
  var update_scatter_type = false;
  var update_time_range = false;
  var update_ts_area = false;
  var update_profile_area = false;
  var update_ref_area = false;

  /* get heatmap type value. set default value if not set: */
  var heatmap_type = heatmap_type ||
      plot_vars[fid]['heatmap_type'] || plot_vars['heatmap_type'];
  /* check if heatmap type has changed: */
  if (heatmap_type != plot_vars[fid]['heatmap_type']) {
    /* if so, set update flag: */
    update_heatmap_type = true;
  };
  /* store the value: */
  plot_vars[fid]['heatmap_type'] = heatmap_type;

  /* get scatter type value. set default value if not set: */
  var scatter_type = scatter_type || plot_vars[fid]['scatter_type'] ||
                     plot_vars['scatter_type'];
  /* check if scatter type has changed: */
  if (scatter_type != plot_vars[fid]['scatter_type']) {
    /* update flags: */
    update_scatter_type = true;
  };
  /* store the value: */
  plot_vars[fid]['scatter_type'] = scatter_type;

  /* get start and end indexes. set defaults if not set: */
  var start_index = start_index || plot_vars[fid]['start_index'] || 0;
  var end_index = end_index || plot_vars[fid]['end_index'] ||
                  dates.length - 1;
  /* check if indexes have changed: */
  if (start_index != plot_vars[fid]['start_index'] ||
      end_index != plot_vars[fid]['end_index']) {
    /* set time range to be updated: */
    update_time_range = true;
  };
  /* store the values: */
  plot_vars[fid]['start_index'] = start_index;
  plot_vars[fid]['end_index'] = end_index;

  /* get ts_area value. set defaults if not set: */
  var ts_area = ts_area || plot_vars[fid]['ts_area'] ;
  /* arrays for storing time series x and y values: */
  var ts_x = [];
  var ts_y = [];
  /* if time series area is null: */
  if (ts_area == null) {
      /* pick a pixel: */
      var ts_indexes = get_ts_indexes()
      /* store indexes: */
      ts_y.push(ts_indexes[0]);
      ts_x.push(ts_indexes[1]);
  /* time series area is specified: */
  } else {
    /* spin through ts area indexes: */
    for (var i = ts_area[0]; i < ts_area[1]; i++) {
      for (var j = ts_area[2]; j < ts_area[3]; j++) {
        /* if the value is not masked: */
        if (mask[i][j] == 1) {
          /* store x and y index values: */
          ts_y.push(i);
          ts_x.push(j);
        };
      };
    };
  };
  /* convert indexes to area ... x values: */
  if (ts_x.length == 1) {
    var ts_area_x = [ts_x[0], ts_x[0] + 1];
  } else {
    var ts_area_x = [ts_x[0], ts_x.slice(-1)[0] + 1];
  };
  /* y values: */
  if (ts_y.length == 1) {
    var ts_area_y = [ts_y[0], ts_y[0] + 1];
  } else {
    var ts_area_y = [ts_y[0], ts_y.slice(-1)[0] + 1];
  };
  /* set the area: */
  ts_area = [ts_area_y[0], ts_area_y[1],
             ts_area_x[0], ts_area_x[1]];
  /* check if area has changed. use stringify to convert values for
     comparison: */
  if (JSON.stringify(ts_area) != JSON.stringify(plot_vars[fid]['ts_area'])) {
    /* set time series area to be updated: */
    update_ts_area = true;
  };
  /* store the values: */
  plot_vars[fid]['ts_area'] = ts_area;
  plot_vars[fid]['ts_x'] = ts_x;
  plot_vars[fid]['ts_y'] = ts_y;

  /* get profile area value, set defaults if not set: */
  var profile_area = profile_area || plot_vars[fid]['profile_area'];
  /* if profile area is null: */
  if (profile_area == null) {
    /* pick values that hopefully goes through the center (ish): */
    var y_center_index = Math.round(y.length / 2);
    profile_area = [
      y_center_index - 5, 5,
      y_center_index + 5, x.length - 5
    ];
  };
  /* check if area has changed: */
  if (profile_area != plot_vars[fid]['profile_area']) {
    /* set profile area to be updated: */
    update_profile_area = true;
  };
  /* store the values: */
  plot_vars[fid]['profile_area'] = profile_area;

  /* get reference area value, set defaults if not set: */
  var ref_area = ref_area || plot_vars[fid]['ref_area'] || refarea ;
  /* if profile area is null: */
  if (ref_area == null) {
    ref_area = plot_vars['refarea'];
  };
  /* check if area has changed: */
  if (ref_area != plot_vars[fid]['ref_area']) {
    /* set profile area to be updated: */
    update_ref_area = true;
  };
  /* store the values: */
  plot_vars[fid]['ref_area'] = ref_area;


  /** html element variables: **/


  var heatmap_div = plot_vars['heatmap_div'];
  var surf_div = plot_vars['surf_div'];
  var scatter_div = plot_vars['scatter_div'];
  var slider_div = plot_vars['slider_div'];
  var slider_value_div = plot_vars['slider_value_div'];
  var button_disp = plot_vars['button_disp'];
  var button_coh = plot_vars['button_coh'];
  var button_ts = plot_vars['button_ts'];
  var button_profile = plot_vars['button_profile'];
  var button_select = plot_vars['button_select'];
  var button_ref = plot_vars['button_ref'];


  /** update html elements: **/


  /* set click mode: */
  set_click_mode(plot_vars[fid]['click_mode']);

  /* disable button for active heatmap data type: */
  if (plot_vars[fid]['heatmap_type'] == 'disp') {
    button_disp.setAttribute('disabled', true);
    button_coh.removeAttribute('disabled');
  } else {
    button_disp.removeAttribute('disabled');
    button_coh.setAttribute('disabled', true);
  };

  /* disable button for active scatter plot type: */
  if (plot_vars[fid]['scatter_type'] == 'ts') {
    button_ts.setAttribute('disabled', true);
    button_profile.removeAttribute('disabled');
  } else {
    button_ts.removeAttribute('disabled');
    button_profile.setAttribute('disabled', true);
  };

  /* if slider does not exist or page is being updated: */
  if ((slider_div.noUiSlider == undefined) ||
      (page_update == true)) {
    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = dates.length -1;
    /* if slider does not exist: */
    if (slider_div.noUiSlider == undefined) {
      /* create slider: */
      noUiSlider.create(slider_div, {
        start: [start_index, end_index],
        range: {
          min: slider_range_min,
          max: slider_range_max
        },
        connect: true,
        step: 1,
        margin: 1,
        tooltips: false
      });
    } else {
      /* update slider: */
      slider_div.noUiSlider.updateOptions({
        start: [start_index, end_index],
        range: {
          min: slider_range_min,
          max: slider_range_max
        },
        connect: true,
        step: 1,
        margin: 1,
        tooltips: false
      });
    };
    /* start and end dates: */
    var slider_start_date = dates[start_index];
    var slider_end_date = dates[end_index];
    /* set labels: */
    slider_value_div.innerHTML = '<label>' +
                                 slider_start_date +
                                 ' - ' +
                                 slider_end_date +
                                 '</label>';
    /* add change listerner: */
    slider_div.noUiSlider.on('change', function() {
      /* volcano frame: */
      var fid = volcano_frame;
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* indexes to ints: */
      var slider_start_index = parseInt(slider_value[0]);
      var slider_end_index = parseInt(slider_value[1]);
      /* start and end dates: */
      var slider_start_date = plot_vars[fid]['dates'][slider_start_index];
      var slider_end_date = plot_vars[fid]['dates'][slider_end_index];
      /* update plotting: */
      disp_plot(plot_vars[fid]['heatmap_type'],
                plot_vars[fid]['scatter_type'],
                slider_start_index, slider_end_index,
                plot_vars[fid]['ts_area'],
                plot_vars[fid]['profile_area'],
                plot_vars[fid]['ref_area']);
    });
    /* add slide listerner: */
    slider_div.noUiSlider.on('slide', function() {
      /* volcano frame: */
      var fid = volcano_frame;
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* indexes to ints: */
      var slider_start_index = parseInt(slider_value[0]);
      var slider_end_index = parseInt(slider_value[1]);
      /* start and end dates: */
      var slider_start_date = plot_vars[fid]['dates'][slider_start_index];
      var slider_end_date = plot_vars[fid]['dates'][slider_end_index];
      /* set labels: */
      slider_value_div.innerHTML = '<label>' +
                                   slider_start_date +
                                   ' - ' +
                                   slider_end_date +
                                   '</label>';
    });
  /* end slider creation: */
  };


  /** calculate values which need calculating: */


  /* if heatmap disp data needs to be recalculated: */
  if (update_time_range || update_ref_area ||
      plot_vars[fid]['heatmap_disp'] == null ||
      plot_vars[fid]['heatmap_coh'] == null) {
    /* get start and end data: */
    var start_disp = disp[start_index];
    var end_disp = disp[end_index];
    /* get reference area data. arrays of x an y values: */
    var ref_y = [];
    var ref_x = [];
    /* raw data mean valculating values: */
    var ref_sum = 0;
    var ref_count = 0;
    var ref_mean;

    /* spin through ref area indexes: */
    for (var i = ref_area[0]; i < ref_area[1]; i++) {
      for (var j = ref_area[2]; j < ref_area[3]; j++) {
        /* if the value is not masked: */
        if (mask[i][j] == 1) {
          /* store x and y index values: */
          ref_y.push(i);
          ref_x.push(j);
          /* if raw data value is valid, add it to the sum: */
          if (end_disp[i][j] != 'null' && start_disp[i][j] != 'null') {
            ref_sum += end_disp[i][j] - start_disp[i][j];
            ref_count += 1;
          };
        };
      };
    };
    /* store values: */
    plot_vars[fid]['ref_y'] = ref_y;
    plot_vars[fid]['ref_x'] = ref_x;

    /* calculate mean for raw values: */
    if (ref_count > 0) {
      ref_mean = ref_sum / ref_count;
    } else {
      ref_mean = 0;
    };

    /* init heatmap data variables: */
    var heatmap_disp = [];
    var heatmap_disp_masked = [];
    var heatmap_hover = [];
    /* variable for displacement value storing: */
    var heatmap_disp_values = [];

    /* spin through data. for each column: */
    for (var i = 0; i < end_disp.length; i++) {
      /* create variables for this row ... raw values ... : */
      heatmap_disp[i] = [];
      heatmap_disp_masked[i] = [];
      heatmap_hover[i] = [];
      /* for each row: */
      for (var j = 0; j < end_disp[0].length; j++) {
        /* calculate raw data value. if start / end values are null: */
        if (end_disp[i][j] == 'null' || start_disp[i][j] == 'null') {
          heatmap_disp[i][j] = 'null';
        } else {
          heatmap_disp[i][j] = ((end_disp[i][j] - start_disp[i][j]) -
                                ref_mean).toFixed(2);
        };
        /* if this pixel is masked ... : */
        if (mask[i][j] == 0) {
          /* masked data values: */
          heatmap_disp_masked[i][j] = 'null';
          var disp_hover_label = 'masked';
          var coh_hover_label = coh[i][j];
          /* add zeros to lists of raw values for min / max: */
          heatmap_disp_values.push(0);
        } else {
          /* else, we have 'good' values: */
          heatmap_disp_masked[i][j] = heatmap_disp[i][j];
          var coh_hover_label = coh[i][j];
          /* check if value is null: */
          if (heatmap_disp[i][j] != 'null') {
            /* add to values for min / max calculating: */
            heatmap_disp_values.push(heatmap_disp[i][j]);
            /* set hover label: */
            var disp_hover_label = heatmap_disp[i][j] + ' mm';
          } else {
            /* set hover label to null: */
            var disp_hover_label = 'null';
          };
        };
        /* hover data values: */
        heatmap_hover[i][j] =
          'lat : ' + plot_vars[fid]['y'][i] + '<br>' +
          'lon : ' + plot_vars[fid]['x'][j] + '<br>' +
          'displacement : ' + disp_hover_label + '<br>' +
          'coherence : ' + coh_hover_label;
      /* end for j: */
      };
    /* end for i: */
    };
    /* store the values: */
    plot_vars[fid]['heatmap_disp'] = heatmap_disp;
    plot_vars[fid]['heatmap_disp_masked'] = heatmap_disp_masked;
    plot_vars[fid]['heatmap_hover'] = heatmap_hover;

    /* if z min or max values are not set: */
    if (plot_vars[fid]['heatmap_disp_z_min'] == null ||
        plot_vars[fid]['heatmap_disp_z_max'] == null) {
      /* sort disp values: */
      heatmap_disp_values.sort(function num_cmp(a, b) {
        return a - b;
      });
      /* calculate min and max values at 1st and 99th percentiles. raw: */
      var heatmap_disp_z_min = heatmap_disp_values[
                                 Math.ceil((heatmap_disp_values.length /
                                            100) * 1)];
      var heatmap_disp_z_max = heatmap_disp_values[
                                 Math.floor((heatmap_disp_values.length /
                                             100) * 99)];
    } else {
      /* use stored values: */
      var heatmap_disp_z_min = plot_vars[fid]['heatmap_disp_z_min'];
      var heatmap_disp_z_max = plot_vars[fid]['heatmap_disp_z_max'];
    };
  /* end if heatmap disp data update: */
  };
  /* store the values: */
  plot_vars[fid]['heatmap_disp_z_min'] = heatmap_disp_z_min;
  plot_vars[fid]['heatmap_disp_z_max'] = heatmap_disp_z_max;

  /* create arrays of x and y indexes, if they don't exist. this should
     help keep the spacing for the heatmap plot even.
     x values: */
  if (plot_vars[fid]['x_indexes'] == null) {
    var x_indexes = [];
    for (var i = 0; i < plot_vars[fid]['x'].length; i++) {
      x_indexes.push(i);
    };
  } else {
    var x_indexes = plot_vars[fid]['x_indexes'];
  };
  /* y values: */
  if (plot_vars[fid]['y_indexes'] == null) {
    var y_indexes = [];
    for (var i = 0; i < plot_vars[fid]['y'].length; i++) {
      y_indexes.push(i);
    };
  } else {
    var y_indexes = plot_vars[fid]['y_indexes'];
  };
  /* store the values: */
  plot_vars[fid]['x_indexes'] = x_indexes;
  plot_vars[fid]['y_indexes'] = y_indexes;

  /* check if time series area has changed: */
  if (update_ts_area) {
    /* ts lat and lon values for time series plot title: */
    if (ts_x.length == 1) {
      var ts_lon = x[ts_x[0]];
    } else {
      var ts_lon = x[Math.min.apply(Math, ts_x)] + ' - ' +
                   x[Math.max.apply(Math, ts_x)];
    };
    if (ts_y.length == 1) {
      var ts_lat = y[ts_y[0]];
    } else {
      var ts_lat = y[Math.min.apply(Math, ts_y)] + ' - ' +
                   y[Math.max.apply(Math, ts_y)];
    };
  };
  /* store the title: */
  var ts_title = 'lat : ' + ts_lat +
                 ', lon : ' + ts_lon;
  plot_vars[fid]['ts_title'] = ts_title;

  /* if time series data needs to be updated: */
  if (update_time_range || update_ts_area || update_ref_area) {
    /* get start data: */
    var start = disp[start_index];
    /* get reference area data: */
    var ts_ref_mean = get_area_mean(ref_area, start);
    var ts_ref_minus_disp = get_area_mean(ts_area,  start) - ts_ref_mean;
    /* init vars for data: */
    var ts_disp = [];
    var ts_hover = [];
    /* have loop through time series to get values: */
    for (var i = start_index; i < end_index + 1; i++) {
      /* disp data value: */
      var value_disp = get_area_mean(ts_area, disp[i]);
      /* ref area mean: */
      var ref_mean = get_area_mean(ref_area, disp[i]);
      /* value is data value - ref area mean for time step - ref area mean
         for start data: */
      var value_disp_out = value_disp - ref_mean - ts_ref_minus_disp;
      /* add to ts data: */
      ts_disp.push(value_disp_out);
      /* add hover data: */
      ts_hover.push(dates[i] + ', ' + value_disp_out + ' mm');
    /* end loop through time series: */
    };
  } else {
    /* use stored values: */
    var ts_disp = plot_vars[fid]['ts_disp'];
    var ts_hover = plot_vars[fid]['ts_hover'];
  };
  /* store values: */
  plot_vars[fid]['ts_disp'] = ts_disp;
  plot_vars[fid]['ts_hover'] = ts_hover;

  /* check if profile data calculation is required: */
  if (update_time_range || update_profile_area || update_ref_area) {
    /* get profile values for 50 values, start point -> end_point: */
    var p_step = 50;
    var p_y_inc = (profile_area[2] - profile_area[0]) / p_step;
    var p_x_inc = (profile_area[3] - profile_area[1]) / p_step;
    /* init profile data variables: */
    var profile_disp = [];
    var profile_dist = [0];
    var profile_hover = [];
    /* init lists for lat / lon storage: */
    var p_lat = [];
    var p_lon = [];
    /* loop through values: */
    for (var i = 0; i < p_step; i++) {
      /* get y and x indexes: */
      var p_y_step_ix = Math.round(profile_area[0] + (i * p_y_inc));
      var p_x_step_ix = Math.round(profile_area[1] + (i * p_x_inc));
      /* get displacement value and to profile data: */
      profile_disp.push(heatmap_disp_masked[p_y_step_ix][p_x_step_ix]
      );
      /* get lat and lon values: */
      p_lat.push(y[p_y_step_ix]);
      p_lon.push(x[p_x_step_ix]);
      /* if index is > 0, calculate distance: */
      if (i > 0) {
        /* get step distance: */
        var p_step_dist = get_distance(
          {latitude: p_lat[i - 1], longitude: p_lon[i - 1]},
          {latitude: p_lat[i], longitude: p_lon[i]}
        ) + profile_dist[i - 1];
        /* add to array: */
        profile_dist.push(+parseFloat(p_step_dist).toFixed(2));
      };
      /* update hover data: */
      profile_hover.push(profile_dist[i] + ' km, ' +
                         profile_disp[i] + ' mm');
      };
      /* profile x and y are profile area points: */
      var profile_x = [profile_area[1], profile_area[3]];
      var profile_y = [profile_area[0], profile_area[2]];
  } else {
    /* get stored values: */
    var profile_disp = plot_vars[fid]['profile_disp'];
    var profile_dist = plot_vars[fid]['profile_dist'];
    var profile_hover = plot_vars[fid]['profile_hover'];
    var profile_x = plot_vars[fid]['profile_x'];
    var profile_y = plot_vars[fid]['profile_y'];
  };
  /* store values: */
  plot_vars[fid]['profile_disp'] = profile_disp;
  plot_vars[fid]['profile_dist'] = profile_dist;
  plot_vars[fid]['profile_hover'] = profile_hover;
  plot_vars[fid]['profile_x'] = profile_x;
  plot_vars[fid]['profile_y'] = profile_y;


  /** plotting variables: **/


  /* heatmap displacement variables: */
  var heatmap_disp_title = plot_vars['heatmap_disp_title'];
  var heatmap_disp_colorscale = plot_vars['heatmap_disp_colorscale'];
  var heatmap_disp_colorbar = {
    'titleside': 'right',
    'x': 1.10
  };
  /* try to add suitable prefix to maintain a consistent colorbar
     width ... : */
  if (z_min < -100) {
    heatmap_disp_colorbar['tickprefix'] = ' ';
  } else if (z_max > 100) {
    heatmap_disp_colorbar['tickprefix'] = '  ';
  } else {
    heatmap_disp_colorbar['tickprefix'] = '   ';
  };

  /* heatmap coherence variables: */
  var heatmap_coh_title = plot_vars['heatmap_coh_title'];
  var heatmap_coh_colorscale = plot_vars['heatmap_coh_colorscale'];
  var heatmap_coh_z_min = plot_vars['heatmap_coh_z_min'];
  var heatmap_coh_z_max = plot_vars['heatmap_coh_z_max'];
  var heatmap_coh_colorbar = {
    'tickprefix': '    ',
    'x': 1.10
  };

  /* if displacement heatmap plotting: */
  if (heatmap_type == 'disp') {
    /* z variables: */
    var z = heatmap_disp_masked;
    var z_min = heatmap_disp_z_min
    var z_max = heatmap_disp_z_max
    var heatmap_title = heatmap_disp_title;
    var heatmap_colorbar = heatmap_disp_colorbar;
    var heatmap_colorscale = heatmap_disp_colorscale;
  } else {
    /* z variables: */
    var z = coh;
    var z_min = heatmap_coh_z_min;
    var z_max = heatmap_coh_z_max;
    var heatmap_title = heatmap_coh_title;
    var heatmap_colorbar = heatmap_coh_colorbar;
    var heatmap_colorscale = heatmap_coh_colorscale;
  };

  /* if time series plotting: */
  if (scatter_type == 'ts') {
    var selected_x = ts_x;
    var selected_y = ts_y;
    var selected_mode = 'markers';
    var selected_hover = 'selected area';
    var scatter_x = dates.slice(start_index, end_index + 1);
    var scatter_y = ts_disp;
    var scatter_hover = ts_hover;
    var scatter_mode = 'markers';
    var scatter_title = 'lat : ' + ts_lat + ', lon : ' + ts_lon;
    var scatter_x_title = 'date';
  } else {
    /* profile plotting: */
    var selected_x = profile_x;
    var selected_y = profile_y;
    var selected_mode = 'lines+markers';
    var selected_hover = '';
    var scatter_x = profile_dist;
    var scatter_y = profile_disp;
    var scatter_hover = profile_hover;
    var scatter_mode = 'lines';
    var scatter_title = 'displacement profile';
    var scatter_x_title = 'distance (km)';
  };
  /* store current scatter x and y values: */
  plot_vars[fid]['selected_x'] = selected_x;
  plot_vars[fid]['selected_y'] = selected_y;


  /** heatmap plot: **/


  /* heatmap plot: */
  var heatmap = {
    'type': 'heatmap',
    'x': x_indexes,
    'y': y_indexes,
    'z': z,
    'zmin': z_min,
    'zmax': z_max,
    'colorbar': heatmap_colorbar,
    'colorscale': heatmap_colorscale,
    'hoverinfo': 'text',
    'text': heatmap_hover
  };

  /* scatter plot of ref area: */
  var heatmap_scatter_ref = {
    'type': 'scatter',
    'mode': 'markers',
    'x': ref_x,
    'y': ref_y,
    'marker': {
      'color': '#ff0000',
      'size': 7,
    },
    'hoverinfo': 'text',
    'text': 'reference area'
  };

  /* scatter plot of selected pixel: */
  var heatmap_scatter_selected = {
    'type': 'scatter',
    'mode': selected_mode,
    'x': selected_x,
    'y': selected_y,
    'marker': {
      'color': '#00ff00',
      'size': 7,
    },
    'hoverinfo': 'text',
    'text': selected_hover
  };

  /* plot to generate lat and lon axes: */
  var heatmap_scatter_ll = {
    'type': 'scatter',
    'x': x[0],
    'y': y[0],
    'xaxis': 'x2',
    'yaxis': 'y2',
    'showscale': false,
    'hoverinfo': 'none',
    'visible': false
  };

  /* plot to generate distance axes: */
  var heatmap_scatter_dist = {
    'type': 'scatter',
    'x': x_indexes[0],
    'y': y_indexes[0],
    'xaxis': 'x3',
    'yaxis': 'y3',
    'showscale': false,
    'hoverinfo': 'none',
    'visible': false
  };

  /* plot data, in order of plotting: */
  var heatmap_data = [heatmap, heatmap_scatter_ref, heatmap_scatter_selected,
                      heatmap_scatter_ll, heatmap_scatter_dist];

  /* plot update, if updating: */
  var heatmap_update = {
    'x': [x_indexes, ref_x, selected_x, x[0], x_indexes[0]],
    'y': [y_indexes, ref_y, selected_y, y[0], y_indexes[0]],
    'z': [z, null, null, null, null],
    'zmin': [z_min, null, null, null, null],
    'zmax': [z_max, null, null, null, null],
    'mode': [null, 'markers', selected_mode, null, null],
    'colorbar': [heatmap_colorbar, null, null, null, null],
    'colorscale': [heatmap_colorscale, null, null, null, null],
    'text': [heatmap_hover, 'reference area', selected_hover, null, null]
  };

  /* heatmap layout: */
  var heatmap_layout = {
    'title': {
      'text': heatmap_title,
      'x': 0.04,
      'y': 0.96
    },
    /* axis based on index values': */
    'xaxis': {
      'title': 'longitude',
      'range': [x_indexes[0], x_indexes.slice(-1)[0]],
      'zeroline': false,
      'autorange': false,
      'scaleanchor': 'y',
      'scaleratio': 1,
      'constrain': 'domain',
      'visible': false
    },
    'yaxis': {
      'title': 'latitude',
      'range': [y_indexes[0], y_indexes.slice(-1)[0]],
      'zeroline': false,
      'autorange': false,
      'constrain': 'domain',
      'visible': false
    },
    /* axis based on lat and lon values: */
    'xaxis2': {
      'title': 'longitude',
      'overlaying': 'x',
      'range': [x[0], x.slice(-1)[0]],
      'zeroline': false,
      'autorange': false,
      'scaleanchor': 'y2',
      'scaleratio': 1,
      'constrain': 'domain',
      'side': 'bottom'
    },
    'yaxis2': {
      'title': 'latitude',
      'overlaying': 'y',
      'range': [y[0], y.slice(-1)[0]],
      'zeroline': false,
      'autorange': false,
      'constrain': 'domain',
      'side': 'left'
    },
    /* axis based on distance values: */
    'xaxis3': {
      'title': {
        'text': 'km',
        'font': {
          'size': 14,
          'color': '#666666'
        },
      },
      'overlaying': 'x',
      'range': [-x_dist / 2, x_dist / 2],
      'zeroline': false,
      'ticks': 'outside',
      'showgrid': false,
      'side': 'top'
    },
    'yaxis3': {
      'title': {
        'text': 'km',
        'font': {
          'size': 14,
          'color': '#666666'
        },
      },
      'overlaying': 'y',
      'range': [-y_dist / 2, y_dist / 2],
      'zeroline': false,
      'ticks': 'outside',
      'showgrid': false,
      'side': 'right'
    },
    'hovermode': 'closest',
    'dragmode': 'select',
    'showlegend': false
  };

  /* update layout if updating: */
  var heatmap_layout_update = {
    'title': {
      'text': heatmap_title,
      'x': 0.04,
      'y': 0.96
    }
  };

  /* heatmap config: */
  var heatmap_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines'
    ],
    'responsive': true
  };


  /** surface plot: **/


  /* set up the colorbar: */
  var surf_colorbar = heatmap_colorbar;
  surf_colorbar['len'] = 0.9;
  surf_colorbar['thickness'] = 25;
  surf_colorbar['xpad'] = 0;

  /* 3d surface plot: */
  var surf = {
    'type': 'surface',
    'x': x,
    'y': y,
    'z': heatmap_disp_masked,
    'zmin': heatmap_disp_z_min,
    'zmax': heatmap_disp_z_max,
    'colorbar': heatmap_disp_colorbar,
    'colorscale': heatmap_disp_colorscale,
    'hoverinfo': 'text',
    'text': heatmap_hover
  };

  /* plot data, in order of plotting: */
  var surf_data = [surf];

  /* plot update, if updating: */
  var surf_update = {
    'z': [heatmap_disp_masked],
  };

  /* surface plot layout: */
  var surf_layout = {
    'scene': {
      'aspectmode': 'cube',
      'xaxis': {
        'title': 'longitude',
        'range': [x.slice(-1)[0], x[0]],
        'zeroline': false,
        'autorange': false,
        'constrain': 'domain'
      },
      'yaxis': {
        'title': 'latitude',
        'range': [y.slice(-1)[0], y[0]],
        'zeroline': false,
        'autorange': false,
        'constrain': 'domain'
      },
      'zaxis': {
        'title': heatmap_disp_title
      }
    },
    'margin': {
      'l': 0,
      'r': 0,
      'b': 15,
      't': 25,
    }
  };

  /* surface plot config: */
  var surf_conf = {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines'
    ],
    'responsive': true
  };


  /** scatter plot: **/


  /* scatter plot: */
  var scatter = {
    'type': 'scatter',
    'x': scatter_x,
    'y': scatter_y,
    'mode': scatter_mode,
    'marker': {
      'color': '#ff6666'
    },
    'hoverinfo': 'text',
    'hovertext': scatter_hover
  };

  /* plot data, in order of plotting: */
  var scatter_data = [scatter];

  /* plot update, if updating: */
  var scatter_update = {
    'x': [scatter_x],
    'y': [scatter_y],
    'mode': [scatter_mode],
    'hovertext': [scatter_hover]
  };

  /* scatter plot layout: */
  var scatter_layout = {
    'title': {
      'text': scatter_title,
      'x': 0.04,
      'y': 0.96
    },
    'xaxis': {
      'title': scatter_x_title,
      'zeroline': false
    },
    'yaxis': {
      'title': 'displacement (mm)',
      'zeroline': false
    },
    'hovermode': 'closest'
  };

  /* layout update, if updating: */
  var scatter_layout_update = {
    'title': {
      'text': scatter_title,
      'x': 0.04,
      'y': 0.96
    },
    'xaxis': {
      'title': scatter_x_title,
      'zeroline': false
    },
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


  /** heatmap plot click functions: */


  /* on click function: */
  function heatmap_on_click(click_data) {

    /* volcano frame id: */
    var fid = volcano_frame;
    /* x and y indexes from data: */
    var click_y = click_data.points[0].y;
    var click_x = click_data.points[0].x;
    /* give up if either is not defined: */
    if (click_y == undefined || click_x == undefined) {
      return;
    };

    /* don't do anything if this is a masked pixel: */
    if (mask[click_y][click_x] == 0) {
      {};
    /* don't do anything if this is a null pixel: */
    } else if (plot_vars[fid]['heatmap_disp_masked'][click_y][click_x] == 'null') {
      {};
    /* don't do anything if this the currently selected pixel, and time
       only a single pixel is currently selected: */
    } else if (plot_vars[fid]['selected_y'].length == 1 &&
               plot_vars[fid]['selected_x'].length == 1 &&
               plot_vars[fid]['selected_y'].indexOf(click_y) > -1 &&
               plot_vars[fid]['selected_x'].indexOf(click_x) > -1) {
      {};
    /* don't do anything if this the currently selected pixel, and profile
       plotting: */
    } else if (plot_vars[fid]['scatter_type'] == 'profile' &&
               plot_vars[fid]['click_mode'] == 'select' &&
               click_x == plot_vars['hover_x'] &&
               click_y == plot_vars['hover_y'] &&
               plot_vars['hover'] == true) {
      {};
    /* don't do anything if this is the reference area, and reference area
       is a single pixel: */
    } else if (plot_vars[fid]['ref_y'].length == 1 &&
               plot_vars[fid]['ref_x'].length == 1 &&
               plot_vars[fid]['ref_y'].indexOf(click_y) > -1 &&
               plot_vars[fid]['ref_x'].indexOf(click_x) > -1) {
      {};
    /* otherwise, update the plots: */
    } else {
      /* reference area updating: */
      if (plot_vars[fid]['click_mode'] == 'ref') {
        disp_plot(plot_vars[fid]['heatmap_type'],
                  plot_vars[fid]['scatter_type'],
                  plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
                  plot_vars[fid]['ts_area'],
                  plot_vars[fid]['profile_area'],
                  [click_y, click_y + 1, click_x, click_x + 1]);
      } else {
        /* if scatter type is 'ts: */
        if (plot_vars[fid]['scatter_type'] == 'ts') {
          /* selected pixel updating: */
          disp_plot(plot_vars[fid]['heatmap_type'],
                    plot_vars[fid]['scatter_type'],
                    plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
                    [click_y, click_y + 1, click_x, click_x + 1],
                    plot_vars[fid]['profile_area'],
                    plot_vars[fid]['ref_area']);
        } else {
          /* profile plotting ... if hovering: */
          if (plot_vars['hover'] == true) {
            /* unset hover variable: */
            plot_vars['hover'] = false;
            /* update plot: */
            disp_plot(plot_vars[fid]['heatmap_type'],
                      plot_vars[fid]['scatter_type'],
                      plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
                      plot_vars[fid]['ts_area'],
                      [
                        plot_vars['hover_y'], plot_vars['hover_x'],
                        click_y, click_x
                      ],
                      plot_vars[fid]['ref_area']);
            /* and return: */
            return;
         } else {
            /* start hovering: */
            plot_vars['hover'] = true;
            plot_vars['hover_x'] = click_x;
            plot_vars['hover_y'] = click_y;
          };
        };
      };
    };
  };

  /* on hover function: */
  function heatmap_on_hover(hover_data) {

    /* volcano frame id: */
    var fid = volcano_frame;
    /* if profile plotting and click mode is select: */
    if (plot_vars[fid]['scatter_type'] == 'profile' &&
        plot_vars[fid]['click_mode'] == 'select') {

      /* if currently hovering: */
      if (plot_vars['hover'] == true) {
        /* get x and y mouse value: */
        var mouse_x = hover_data.points[0].x;
        var mouse_y = hover_data.points[0].y;
        /* update data: */
        var heatmap_data_update = {
          x: [null, plot_vars[fid]['ref_x'],
              [plot_vars['hover_x'], mouse_x]],
          y: [null, plot_vars[fid]['ref_y'],
              [plot_vars['hover_y'], mouse_y]],
        };
        /* perform the update: */
        Plotly.update(plot_vars['heatmap_div'],
                      heatmap_data_update);
      };

    };
  };

  /* on select function: */
  function heatmap_on_select(sel_data) {

    /* volcano frame id: */
    var fid = volcano_frame;
    /* if profile plot mode, and click mode is select, don't do anything: */
    if (plot_vars[fid]['plot_type'] == 'profile' &&
        plot_vars[fid]['click_mode'] == 'select') {
      /* clear selected points: */
      var heatmap_data_update = {
        selectedpoints: [null, null, 0, 0]
      };
      Plotly.update(plot_vars['heatmap_div'], heatmap_data_update, {});
      return;
    };

    /* only if sel_data is defined: */
    if (sel_data != undefined && sel_data.range != undefined) {

      /* get nearest x and y values: */
      var sel_x0 = get_nearest_value(sel_data.range.x[0], x_indexes);
      var sel_x1 = get_nearest_value(sel_data.range.x[1], x_indexes);
      sel_x1++;
      var sel_y0 = get_nearest_value(sel_data.range.y[0], y_indexes);
      var sel_y1 = get_nearest_value(sel_data.range.y[1], y_indexes);
      sel_y1++;
      /* check if all values are masked. presume yes: */
      var ref_masked = true;
      /* loop through selected values: */
      for (var i = sel_y0; i < sel_y1 ; i++) {
        for (var j = sel_x0; j < sel_x1; j++) {
          /* if any unmasked values, things are o.k.: */
          if (plot_vars[fid]['mask'][i][j] == 1) {
            ref_masked = false;
            break;
          };
        };
      };

      /* if all values masked, return: */
      if (ref_masked) {
        return;
      };

      /* if current click mode is reference area selecting: */
      if (plot_vars[fid]['click_mode'] == 'ref') {

        /* update plot: */
        disp_plot(plot_vars[fid]['heatmap_type'],
                  plot_vars[fid]['scatter_type'],
                  plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
                  plot_vars[fid]['ts_area'],
                  plot_vars[fid]['profile_area'],
                  [sel_y0, sel_y1, sel_x0, sel_x1]);

      /* if current click mode is points to plot selecting: */
      } else if (plot_vars[fid]['click_mode'] == 'select') {

        /* update plot: */
        disp_plot(plot_vars[fid]['heatmap_type'],
                  plot_vars[fid]['scatter_type'],
                  plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
                  [sel_y0, sel_y1, sel_x0, sel_x1],
                  plot_vars[fid]['profile_area'],
                  plot_vars[fid]['ref_area']);

      };
    };

    /* make sure slected pixel and reference area are still 'selected',
       i.e. visible, after area selection: */
    var heatmap_data_update = {
      selectedpoints: [null, null, 0, 0]
    };
    Plotly.update(plot_vars['heatmap_div'], heatmap_data_update, {});
  };


  /** create / update plots: **/


  /* heatmap plot: */
  if (plot_vars[fid]['heatmap_plot'] == null) {
    /* create the heatmap plot: */
    var heatmap_plot = Plotly.newPlot(heatmap_div, heatmap_data,
                                      heatmap_layout, heatmap_conf);
    /* store the plot information in plot_vars[volcano_frame]: */
    plot_vars[fid]['heatmap_plot'] = heatmap_plot;
    /* add click functions: */
    heatmap_div.on('plotly_click', heatmap_on_click);
    heatmap_div.on('plotly_hover', heatmap_on_hover);
    heatmap_div.on('plotly_selected', heatmap_on_select);
  } else {
    /* update the plot: */
    Plotly.update(heatmap_div, heatmap_update, heatmap_layout_update);
  };

  /* surface plot: */
  if (plot_vars[fid]['surf_plot'] == null) {
    /* create the surf plot: */
    var surf_plot = Plotly.newPlot(surf_div, surf_data,
                                   surf_layout, surf_conf);
    /* store the plot information in plot_vars[volcano_frame]: */
    plot_vars[fid]['surf_plot'] = surf_plot;
  } else {
    /* update the plot: */
    Plotly.update(surf_div, surf_update);
  };

  /* scatter plot: */
  if (plot_vars[fid]['scatter_plot'] == null) {
    /* create the scatter plot: */
    var scatter_plot = Plotly.newPlot(scatter_div, scatter_data,
                                      scatter_layout, scatter_conf);
    /* store the plot information in plot_vars[volcano_frame]: */
    plot_vars[fid]['scatter_plot'] = scatter_plot;
  } else {
    /* update the plot: */
    Plotly.update(scatter_div, scatter_update, scatter_layout_update);
  };

/* end disp_plot function: */
};


/** plot updating functions: **/

/* function to update heatmap type: */
function set_heatmap_type(heatmap_type) {
  var fid = volcano_frame;
  disp_plot(heatmap_type,
    plot_vars[fid]['scatter_type'],
    plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
    plot_vars[fid]['ts_area'],
    plot_vars[fid]['profile_area'],
    plot_vars[fid]['ref_area']);
};

/* function to update scatter type: */
function set_scatter_type(scatter_type) {
  var fid = volcano_frame;
  disp_plot(plot_vars[fid]['heatmap_type'],
    scatter_type,
    plot_vars[fid]['start_index'], plot_vars[fid]['end_index'],
    plot_vars[fid]['ts_area'],
    plot_vars[fid]['profile_area'],
    plot_vars[fid]['ref_area']);
};

/* display surface plot function: */
function display_surf_plot() {
  var surf_div = document.getElementById("surf_plot_container");
  surf_div.style.left = '0px';
  surf_div.style.top = '0px';
};

/* close surface plot function: */
function close_surf_plot() {
  var surf_div = document.getElementById("surf_plot_container");
  surf_div.style.left = '-999999px';
  surf_div.style.top = '-999999px';
};

/* add listener for surf plot closing: */
window.addEventListener('load', function() {
  var surf_plot_close = document.getElementById("surf_plot_close");
  surf_plot_close.addEventListener('click', function() {
    close_surf_plot();
  });
});
