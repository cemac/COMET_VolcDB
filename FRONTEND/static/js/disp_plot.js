
var plot_vars = {};

function set_plot_vars(frame_id) {
  if (plot_vars[frame_id] == undefined) {
    plot_vars[frame_id] = {
      data_type: null,
      start_index: null,
      end_index: null,
      x_indexes: null,
      y_indexes: null,
      z_min_raw: null,
      z_max_raw: null,
      z_min_coh: 0,
      z_max_coh: 1.0,
      ts_y: null,
      ts_x: null,
      ts_area: null,
      ref_y: null,
      ref_x: null,
      ref_area: null,
      heatmap_data: {},
      hover_data: {},
      ts_data: {},
      ts_data_raw: null,
      heatmap_plot: null,
      ts_plot: null,
      click_mode: 'select',
      update_page: false
    };
  };
};

/* function to set the click mode to either 'select' (selected pixel) or
   'ref' (reference area): */
function set_click_mode(click_mode) {
  /* get button elements: */
  var button_select = document.getElementById('click_mode_button_select');
  var button_ref = document.getElementById('click_mode_button_ref');
  /* get heatmap plot div: */
  var heatmap_div = document.getElementById('heatmap_plot');
  /* disable button for active click mode: */
  if (click_mode == 'ref') {
    button_ref.setAttribute('disabled', true);
    button_select.removeAttribute('disabled');
    plot_vars[volcano_frame]['click_mode'] = 'ref';
    if (heatmap_div.data != undefined) {
      Plotly.update(heatmap_div, {}, {dragmode: 'select'});
    };
  } else {
    button_select.setAttribute('disabled', true);
    button_ref.removeAttribute('disabled');
    plot_vars[volcano_frame]['click_mode'] = 'select';
    if (heatmap_div.data != undefined) {
      Plotly.update(heatmap_div, {}, {dragmode: 'select'});
    };
  };
};

/* function to save time series data as csv file: */
function ts_to_csv() {
  /* get dates in current range: */
  var ts_dates = disp_data['dates'].slice(plot_vars[volcano_frame]['start_index'],
                                          plot_vars[volcano_frame]['end_index'] + 1);
  /* get displacement values: */
  var ts_data = plot_vars[volcano_frame]['ts_data_raw'];
  /* start csv content: */
  var csv_data = 'data:text/csv;charset=utf-8,';
  /* header line: */
  csv_data += 'date,displacement (mm)\r\n';
  /* loop through values: */
  for (var i = 0; i < ts_dates.length - 1; i++) {
    /* add line to csv: */
    csv_data += ts_dates[i] + ',' +  ts_data[i].toFixed(2) + '\r\n';
  }
  /* encode csv data: */
  var encoded_uri = encodeURI(csv_data);
  /* name for csv file: */
  var csv_name = volcano_name + '_' + volcano_frame + '.csv';
  /* create a temporary link: */
  var csv_link = document.createElement("a");
  csv_link.setAttribute("href", encoded_uri);
  csv_link.setAttribute("download", csv_name);
  csv_link.style.visibility = 'hidden';
  /* add link to document, click to init download, then remove: */
  document.body.appendChild(csv_link);
  csv_link.click();
  document.body.removeChild(csv_link);
};

function disp_plot(data_type, start_index, end_index, ts_area, ref_area) {

  /* make sure ref_area is set: */
  if (ref_area == undefined) {
    if (plot_vars[volcano_frame]['ref_area'] != undefined) {
      ref_area = plot_vars[volcano_frame]['ref_area'];
    } else {
      ref_area = null;
    };
  };

  /* if nothing has changed ... : */
  if (data_type && data_type == plot_vars[volcano_frame]['data_type'] &&
      start_index && start_index == plot_vars[volcano_frame]['start_index'] &&
      end_index && end_index == plot_vars[volcano_frame]['end_index'] &&
      ts_area == plot_vars[volcano_frame]['ts_area'] &&
      ref_area && ref_area == plot_vars[volcano_frame]['ref_area']) {
    /* return: */
    return;
  };

  /* return the nearest value from an array: */
  function get_nearest_value(val, arr) {
    /* init min diff variable: */
    var min_diff = 999999;
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

  /* function to pick an initial index for time series, which is not
     masked, and is near the center: */
  function get_ts_indexes() {
    /* get x and y midpoint indexes: */
    var mid_y = Math.floor(y_data.length / 2) - 1;
    var mid_x = Math.floor(x_data.length / 2) - 1;
    /* find the first value near center which is not masked: */
    for (var i = mid_y; i < mask_data.length; i ++) {
      for (var j = mid_x; j < mask_data[0].length; j ++) {
        if (mask_data[i][j] == 1) {
          return[i, j];
        };
      };
    };
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

  /* get plot container divs: */
  var heatmap_div = document.getElementById('heatmap_plot');
  var ts_div = document.getElementById('ts_plot');
  /* buttons: */
  var button_disp = document.getElementById('data_type_button_disp');
  var button_coh = document.getElementById('data_type_button_coh');
  /* slider div: */
  var slider_div = document.getElementById('data_range_control');
  var slider_value_div = document.getElementById('data_range_value');

  /* data variables: */
  var x_data = disp_data['x'];
  var y_data = disp_data['y'];
  var x_dist = disp_data['x_dist'];
  var y_dist = disp_data['y_dist'];
  var date_data = disp_data['dates'];

  var disp_data_raw = disp_data['data_raw'];
  var coh_data = disp_data['coh'];
  var mask_data = disp_data['mask'];

  /* create arrays of x and y indexes, if they don't exist. this should
     help keep the spacing for the heatmap plot even.
     x values: */
  if (plot_vars[volcano_frame]['x_indexes'] == null) {
    plot_vars[volcano_frame]['x_indexes'] = [];
    for (var i = 0; i < x_data.length; i++) {
      plot_vars[volcano_frame]['x_indexes'].push(i);
    };
  };
  /* y values: */
  if (plot_vars[volcano_frame]['y_indexes'] == null) {
    plot_vars[volcano_frame]['y_indexes'] = [];
    for (var i = 0; i < y_data.length; i++) {
      plot_vars[volcano_frame]['y_indexes'].push(i);
    };
  };
  /* vars for indexes: */
  var x_indexes = plot_vars[volcano_frame]['x_indexes'];
  var y_indexes = plot_vars[volcano_frame]['y_indexes'];

  /* presume nothing to be updated: */
  var update_heatmap_data_type = false;
  var update_heatmap_data_range = false;
  var update_heatmap_data = false;
  var update_ts_data = false;
  var update_ref_data = false;

  /* get data type value. set default value if not set: */
  var data_type = data_type || plot_vars[volcano_frame]['data_type'] || 'raw';
  /* data type to be plotted. check if it has changed: */
  if (data_type != plot_vars[volcano_frame]['data_type']) {
    update_heatmap_data_type = true;
  };
  /* store the value: */
  plot_vars[volcano_frame]['data_type'] = data_type;

  /* disable button for active data type: */
  if (data_type == 'raw') {
    button_disp.setAttribute('disabled', true);
    button_coh.removeAttribute('disabled');
  } else {
    button_disp.removeAttribute('disabled');
    button_coh.setAttribute('disabled', true);
  };

  /* set click mode: */
  set_click_mode(plot_vars[volcano_frame]['click_mode']);

  /* reference area data: */
  if (ref_area == null) {
    ref_area = disp_data['refarea'];
  } else {
    ref_area = ref_area;
  };
  /* if reference area has updated: */
  if (ref_area != plot_vars[volcano_frame]['ref_area']) {
    /* heatmap and time series data is updating: */
    update_ref_data = true;
    update_ts_data = true;
  };
  /* store the value: */
  plot_vars[volcano_frame]['ref_area'] = ref_area;

  /* init vars for time series indexes: */
  var ts_y = [];
  var ts_x = [];
  /* if time series area not specified: */
  if (ts_area == null) {
    /* if time series indexes are also not in plot_vars[volcano_frame]: */
    if (plot_vars[volcano_frame]['ts_y'] == null || plot_vars[volcano_frame]['ts_x'] == null) {
      /* pick a pixel: */
      var ts_indexes = get_ts_indexes()
      ts_y.push(ts_indexes[0]);
      ts_x.push(ts_indexes[1]);
      /* time series data is updating: */
      update_ts_data = true;
    } else {
      /* use values from plot_vars[volcano_frame]: */
      ts_y = plot_vars[volcano_frame]['ts_y'];
      ts_x = plot_vars[volcano_frame]['ts_x'];
    };
  /* time series area is specified: */
  } else {
    /* spin through ts area indexes: */
    for (var i = ts_area[0]; i < ts_area[1]; i++) {
      for (var j = ts_area[2]; j < ts_area[3]; j++) {
        /* if the value is not masked: */
        if (disp_data['mask'][i][j] == 1) {
          /* store x and y index values: */
          ts_y.push(i);
          ts_x.push(j);
        };
      };
    };
  };

  /* get ts_area x and y values: */
  if (ts_y.length == 1) {
    var ts_area_y = [ts_y[0], ts_y[0] + 1];
  } else {
    var ts_area_y = [ts_y[0], ts_y.slice(-1)[0] + 1];
  };
  if (ts_x.length == 1) {
    var ts_area_x = [ts_x[0], ts_x[0] + 1];
  } else {
    var ts_area_x = [ts_x[0], ts_x.slice(-1)[0] + 1];
  };
  /* check values: */
  /* store ts_area values: */
  ts_area = [ts_area_y[0], ts_area_y[1],
             ts_area_x[0], ts_area_x[1]];
  plot_vars[volcano_frame]['ts_area'] = ts_area;

  /* check if time series indexes have changed: */
  if (ts_y != plot_vars[volcano_frame]['ts_y'] || ts_x != plot_vars[volcano_frame]['ts_x']) {
    /* time series data is updating: */
    update_ts_data = true;
    /* store new values: */
    plot_vars[volcano_frame]['ts_y'] = ts_y;
    plot_vars[volcano_frame]['ts_x'] = ts_x;
  };
  /* ts lat and lon values for time series plot title: */
  if (ts_y.length == 1) {
    var ts_lat = y_data[ts_y[0]];
  } else {
    var ts_lat = y_data[Math.min.apply(Math, ts_y)] + ' - ' + y_data[Math.max.apply(Math, ts_y)];
  };
  if (ts_x.length == 1) {
    var ts_lon = x_data[ts_x[0]];
  } else {
    var ts_lon = x_data[Math.min.apply(Math, ts_x)] + ' - ' + x_data[Math.max.apply(Math, ts_x)];
  };

  /* key for this time series: */
  var ts_key = ts_area[0] + '_' + ts_area[1] + '_' +
               ts_area[2] + '_' + ts_area[2] + '_' +
               ref_area[0] + '_' + ref_area[1] + '_' +
               ref_area[2] + '_' + ref_area[3];

  /* get start and indexes. check if values have updated: */
  if (start_index == null || end_index == null ||
      start_index != plot_vars[volcano_frame]['start_index'] ||
      end_index != plot_vars[volcano_frame]['end_index']) {
    /* set data range to be updated: */
    update_heatmap_data_range = true;
    /* also need to recalculate time series: */
    update_ts_data = true;
  };
  /* start index value: */
  if (start_index == null) {
    if (plot_vars[volcano_frame]['start_index'] == null) {
      var start_index = 0;
    } else {
      var start_index = plot_vars[volcano_frame]['start_index'];
    };
  } else {
    var start_index = start_index;
  };
  /* end index value: */
  if (end_index == null) {
    if (plot_vars[volcano_frame]['end_index'] == null) {
      var end_index = date_data.length - 1;
    } else {
      var end_index = plot_vars[volcano_frame]['end_index'];
    };
  } else {
    var end_index = end_index;
  };
  /* store start / end index values: */
  plot_vars[volcano_frame]['start_index'] = start_index;
  plot_vars[volcano_frame]['end_index'] = end_index;
  /* key for this range in data: */
  var range_key = start_index + '_' + end_index + '_' + ref_area[0] + '_' +
                  ref_area[1] + '_' + ref_area[2] + '_' + ref_area[3];;
  /* create key for storing time series data: */
  if (plot_vars[volcano_frame]['ts_data'][range_key] == undefined) {
    plot_vars[volcano_frame]['ts_data'][range_key] = {};
  };

  /* if slider does not exist or page is being updated: */
  if ((slider_div.noUiSlider == undefined) ||
      (page_update == true)) {

    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = date_data.length -1;

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
    var slider_start_date = date_data[start_index];
    var slider_end_date = date_data[end_index];
    /* set labels: */
    slider_value_div.innerHTML = '<label>' +
                                 slider_start_date +
                                 ' - ' +
                                 slider_end_date +
                                 '</label>';
    /* add change listerner: */
    slider_div.noUiSlider.on('change', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* indexes to ints: */
      var slider_start_index = parseInt(slider_value[0]);
      var slider_end_index = parseInt(slider_value[1]);
      /* start and end dates: */
      var slider_start_date = date_data[slider_start_index];
      var slider_end_date = date_data[slider_end_index];
      /* update plotting: */
      disp_plot(null, slider_start_index, slider_end_index,
                plot_vars[volcano_frame]['ts_area'],
                plot_vars[volcano_frame]['ref_area']);
    });
    /* add slide listerner: */
    slider_div.noUiSlider.on('slide', function() {
      /* get slider value: */
      var slider_value = slider_div.noUiSlider.get();
      /* indexes to ints: */
      var slider_start_index = parseInt(slider_value[0]);
      var slider_end_index = parseInt(slider_value[1]);
      /* start and end dates: */
      var slider_start_date = date_data[slider_start_index];
      var slider_end_date = date_data[slider_end_index];
      /* set labels: */
      slider_value_div.innerHTML = '<label>' +
                                   slider_start_date +
                                   ' - ' +
                                   slider_end_date +
                                   '</label>';
    });
  /* end slider creation: */
  };

  /* init z_data variables: */
  var z_data_masked_raw, hover_data_raw;
  /* if data range or reference area is changed ... : */
  if (update_heatmap_data_range == true ||
      update_ref_data == true) {
    /* if data for this range does not exist in plot_vars[volcano_frame]: */
    if (plot_vars[volcano_frame]['heatmap_data'][range_key] == undefined ||
        plot_vars[volcano_frame]['hover_data'][range_key] == undefined) {
      /* need to calculate: */
      update_heatmap_data = true;
    } else {
      /* z_data from stored values: */
      z_data_masked_raw = plot_vars[volcano_frame]['heatmap_data'][range_key]['raw'];
      /* hover data: */
      hover_data_raw = plot_vars[volcano_frame]['hover_data'][range_key]['raw'];
      /* no need to recalculate: */
      update_heatmap_data = false;
    };
  };

  /* init ref_y and ref_x vars: */
  var ref_y = plot_vars[volcano_frame]['ref_y'];
  var ref_x = plot_vars[volcano_frame]['ref_x'];

  /* if data range has changed: */
  if (update_heatmap_data == true || update_ref_data == true) {
    /* get start and end data: */
    var start_data_raw = disp_data_raw[start_index];
    var end_data_raw = disp_data_raw[end_index];
    /* get reference area data. arrays of x an y values: */
    ref_y = [];
    ref_x = [];
    /* raw data mean valculating values: */
    var ref_sum_raw = 0;
    var ref_count_raw = 0;
    var ref_mean_raw;
    /* spin through ref area indexes: */
    for (var i = ref_area[0]; i < ref_area[1]; i++) {
      for (var j = ref_area[2]; j < ref_area[3]; j++) {
        /* if the value is not masked: */
        if (disp_data['mask'][i][j] == 1) {
          /* store x and y index values: */
          ref_y.push(i);
          ref_x.push(j);
          /* if raw data value is valid, add it to the sum: */
          if (end_data_raw[i][j] != 'null' && start_data_raw[i][j] != 'null') {
            ref_sum_raw += end_data_raw[i][j] - start_data_raw[i][j];
            ref_count_raw += 1;
          };
        };
      };
    };
    /* store values: */
    plot_vars[volcano_frame]['ref_y'] = ref_y;
    plot_vars[volcano_frame]['ref_x'] = ref_x;
    /* calculate mean for raw values: */
    if (ref_count_raw > 0) {
      ref_mean_raw = ref_sum_raw / ref_count_raw;
    } else {
      ref_mean_raw = 0;
    };
    /* init variables for raw data: */
    z_data_raw = [];
    var z_data_masked_raw = [];
    var z_values_raw = [];
    var hover_data_raw = [];
    /* spin through data. for each column: */
    for (var i = 0; i < end_data_raw.length; i++) {
      /* create variables for this row ... raw values ... : */
      z_data_raw[i] = [];
      z_data_masked_raw[i] = [];
      hover_data_raw[i] = [];
      /* for each row: */
      for (var j = 0; j < end_data_raw[0].length; j++) {
        /* calculate raw data value. if istart / end values are not null: */
        if (end_data_raw[i][j] == 'null' || start_data_raw[i][j] == 'null') {
          z_data_raw[i][j] = 'null';
        } else {
          z_data_raw[i][j] = ((end_data_raw[i][j] - start_data_raw[i][j])
                              - ref_mean_raw).toFixed(2);
        };
        /* if this pixel is masked ... : */
        if (mask_data[i][j] == 0) {
          /* masked data values: */
          z_data_masked_raw[i][j] = 'null';
          z_label_raw = 'masked';
          coh_label = coh_data[i][j];
          /* add zeros to lists of raw values for min / max: */
          z_values_raw.push(0);
        } else {
          /* else, we have 'good' values: */
          z_data_masked_raw[i][j] = z_data_raw[i][j];
          coh_label = coh_data[i][j];
          /* check if value is null: */
          if (z_data_raw[i][j] != 'null') {
            /* add to values for min / max calculating: */
            z_values_raw.push(z_data_raw[i][j]);
            /* set hover label: */
            z_label_raw = z_data_raw[i][j] + ' mm';
          } else {
            /* set hover label to null: */
            z_label_raw = 'null';
          };
        };
        /* hover data values. raw: */
        hover_data_raw[i][j] = 'lat : ' + y_data[i] + '<br>' +
                               'lon : ' + x_data[j] + '<br>' +
                               'displacement : ' + z_label_raw + '<br>' +
                               'coherence : ' + coh_label;
      /* end for j: */
      };
    /* end for i: */
    };

    /* store calculated values; */
    plot_vars[volcano_frame]['heatmap_data'][range_key] = {};
    plot_vars[volcano_frame]['heatmap_data'][range_key]['raw'] = z_data_masked_raw;
    plot_vars[volcano_frame]['hover_data'][range_key] = {};
    plot_vars[volcano_frame]['hover_data'][range_key]['raw'] = hover_data_raw;

    /* if z min or max values are not set: */
    if (plot_vars[volcano_frame]['z_min_raw'] == null ||
        plot_vars[volcano_frame]['z_max_raw'] == null) {
      /* sort z values: */
      z_values_raw.sort(function num_cmp(a, b) {
        return a - b;
      });
      /* calculate min and max values at 1st and 99th percentiles. raw: */
      var z_min_raw = z_values_raw[Math.ceil((z_values_raw.length / 100)
                                             * 1)];
      var z_max_raw = z_values_raw[Math.floor((z_values_raw.length / 100)
                                              * 99)];
      plot_vars[volcano_frame]['z_min_raw'] = z_min_raw;
      plot_vars[volcano_frame]['z_max_raw'] = z_max_raw;
    };

  /* end if data range has changed: */
  };

  /* if heatmap plotting: */
  if (update_heatmap_data_type || update_heatmap_data_range ||
      update_ref_data) {
    /* get data for plotting: */
    var z_data, z_min, z_max, hover_data;
    hover_data = hover_data_raw;
    if (data_type == 'raw') {
      z_data = z_data_masked_raw;
      z_min = plot_vars[volcano_frame]['z_min_raw'];
      z_max = plot_vars[volcano_frame]['z_max_raw'];

      heatmap_colorbar = { tickprefix: ' ', x: 1.10};
      if (plot_vars[volcano_frame]['z_min_raw'] < -100) {
        heatmap_colorbar = { tickprefix: ' ', x: 1.10};
      } else if (plot_vars[volcano_frame]['z_max_raw'] > 100) {
        heatmap_colorbar = { tickprefix: '  ', x: 1.10};
      } else {
        heatmap_colorbar = { tickprefix: '   ', x: 1.10};
      }

      heatmap_colorscale = [
        [0, 'rgb(26, 51, 153)'],
        [0.25, 'rgb(72, 152, 197)'],
        [0.5, 'rgb(204, 235, 200)'],
        [0.75, 'rgb(192, 159, 58)'],
        [1, 'rgb(127, 25, 0)']
      ];
      heatmap_title = 'displacement (mm)';
    } else {
      z_data = coh_data;
      z_min = plot_vars[volcano_frame]['z_min_coh'];
      z_max = plot_vars[volcano_frame]['z_max_coh'];
      heatmap_colorbar = { tickprefix: '    ', x: 1.10};
      heatmap_colorscale = 'Greys';
      heatmap_title = 'coherence';
    };
  };

  /* if there is no heatmap plot ... : */
  if (plot_vars[volcano_frame]['heatmap_plot'] == null) {
    /* set up the heatmap plot data: */
    var heatmap_disp = {
      type: 'heatmap',
      x: x_indexes,
      y: y_indexes,
      z: z_data,
      zmin: z_min,
      zmax: z_max,
      colorbar: heatmap_colorbar,
      colorscale: heatmap_colorscale,
      hoverinfo: 'text',
      text: hover_data
    };

    /* plot to generate lat and lon axes: */
    var hm_sca = {
      type: 'scatter',
      x: x_data[0],
      y: y_data[0],
      xaxis: 'x2',
      yaxis: 'y2',
      showscale: false,
      hoverinfo: 'none',
      visible: false
    };

    /* plot to generate distance axes: */
    var hm_scb = {
      type: 'scatter',
      x: x_indexes[0],
      y: y_indexes[0],
      xaxis: 'x3',
      yaxis: 'y3',
      showscale: false,
      hoverinfo: 'none',
      visible: false
    };

    /* scatter plot of ref area: */
    var heatmap_ref = {
      type: 'scatter',
      mode: 'markers',
      x: ref_x,
      y: ref_y,
      marker: {
        color: '#ff0000',
        size: 7,
      },
      hoverinfo: 'text',
      text: 'reference area'
    };

    /* scatter plot of selected pixel: */
    var heatmap_selected = {
      type: 'scatter',
      mode: 'markers',
      x: ts_x,
      y: ts_y,
      marker: {
        color: '#00ff00',
        size: 7,
      },
      hoverinfo: 'text',
      text: 'selected pixel'
    };

    /* heatmap layout: */
    var heatmap_layout = {
      title: {
        text: heatmap_title,
        x: 0.04,
        y: 0.96
      },
      /* axis based on index values: */
      xaxis: {
        title: 'longitude',
        range: [x_indexes[0], x_indexes.slice(-1)[0]],
        zeroline: false,
        autorange: false,
        scaleanchor: 'y',
        scaleratio: 1,
        constrain: 'domain',
        visible: false
      },
      yaxis: {
        title: 'latitude',
        range: [y_indexes[0], y_indexes.slice(-1)[0]],
        zeroline: false,
        autorange: false,
        constrain: 'domain',
        visible: false
      },
      /* axis based on lat and lon values: */
      xaxis2: {
        title: 'longitude',
        overlaying: 'x',
        range: [x_data[0], x_data.slice(-1)[0]],
        zeroline: false,
        autorange: false,
        scaleanchor: 'y2',
        scaleratio: 1,
        constrain: 'domain',
        side: 'bottom'
      },
      yaxis2: {
        title: 'latitude',
        overlaying: 'y',
        range: [y_data[0], y_data.slice(-1)[0]],
        zeroline: false,
        autorange: false,
        constrain: 'domain',
        side: 'left'
      },
      /* axis based on distance values: */
      xaxis3: {
        title: {
          text: 'km',
          font: {
            size: 14,
            color: '#666666'
          },
        },
        overlaying: 'x',
        range: [-x_dist / 2, x_dist / 2],
        zeroline: false,
        ticks: 'outside',
        showgrid: false,
        side: 'top'
      },
      yaxis3: {
        title: {
          text: 'km',
          font: {
            size: 14,
            color: '#666666'
          },
        },
        overlaying: 'y',
        range: [-y_dist / 2, y_dist / 2],
        zeroline: false,
        ticks: 'outside',
        showgrid: false,
        side: 'right'
      },
      hovermode: 'closest',
      dragmode: 'select',
      showlegend: false
    };

    /* heatmap config: */
    var heatmap_conf = {
      showLink: false,
      linkText: '',
      displaylogo: false,
      modeBarButtonsToRemove: [
        'autoScale2d',
        'lasso2d',
        'hoverClosestCartesian',
        'hoverCompareCartesian',
        'toggleSpikelines'
      ],
      responsive: true
    };

    /* data, in order of plotting: */
    var heatmap_data = [heatmap_disp, heatmap_ref, heatmap_selected, hm_sca, hm_scb];
    /* create a new plot: */
    var heatmap_plot = Plotly.newPlot(heatmap_div, heatmap_data,
                                      heatmap_layout, heatmap_conf);
    /* store the plot information in plot_vars[volcano_frame]: */
    plot_vars[volcano_frame]['heatmap_plot'] = heatmap_plot;

    /* add on click functionality: */
    heatmap_div.on('plotly_click', function(click_data){
      /* x and y indexes from data: */
      var click_y = click_data.points[0]['pointNumber'][0];
      var click_x = click_data.points[0]['pointNumber'][1];
      /* give up if either is not defined: */
      if (click_y == undefined || click_x == undefined) {
        return;
      };
      /* x and y values of clicked point are grid indexes: */
      var click_y_val = click_y;
      var click_x_val = click_x;
      /* don't do anything if this is a masked pixel: */
      if (disp_data['mask'][click_y][click_x] == 0) {
        {};
      /* don't do anything if this is a null pixel: */
      } else if (plot_vars[volcano_frame]['heatmap_data'][range_key]['raw'][click_y][click_x] == 'null') {
        {};
      /* don't do anything if this the currently selected pixel, and time
         only a single pixel is currently selected: */
      } else if (plot_vars[volcano_frame]['ts_y'].length == 1 &&
                 plot_vars[volcano_frame]['ts_x'].length == 1 &&
                 plot_vars[volcano_frame]['ts_y'].indexOf(click_y_val) > -1 &&
                 plot_vars[volcano_frame]['ts_x'].indexOf(click_x_val) > -1) {
        {};
      /* don't do anything if this is the reference area, and reference area
         is a single pixel: */
      } else if (plot_vars[volcano_frame]['ref_y'].length == 1 &&
                 plot_vars[volcano_frame]['ref_x'].length == 1 &&
                 plot_vars[volcano_frame]['ref_y'].indexOf(click_y_val) > -1 &&
                 plot_vars[volcano_frame]['ref_x'].indexOf(click_x_val) > -1) {
        {};
      /* otherwise, update the plots: */
      } else {
        /* reference area updating: */
        if (plot_vars[volcano_frame]['click_mode'] == 'ref') {
          disp_plot(plot_vars[volcano_frame]['data_type'],
                    plot_vars[volcano_frame]['start_index'], plot_vars[volcano_frame]['end_index'],
                    plot_vars[volcano_frame]['ts_area'],
                    [click_y, click_y + 1, click_x, click_x + 1]);
        } else {
          /* presume selected pixel updating: */
          disp_plot(plot_vars[volcano_frame]['data_type'],
                    plot_vars[volcano_frame]['start_index'], plot_vars[volcano_frame]['end_index'],
                    [click_y, click_y + 1, click_x, click_x + 1],
                    plot_vars[volcano_frame]['ref_area']);
        };
      };
    });

    /* selecting a reference area when multiple points are selected: */
    heatmap_div.on('plotly_selected', function(sel_data){
      /* only if sel_Data is defined: */
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
            if (disp_data['mask'][i][j] == 1) {
              ref_masked = false;
              break;
            };
          };
        };
        /* if all values masked, return: */
        if (ref_masked) {
          return;
        }
        /* if current click mode is reference area selecting: */
        if (plot_vars[volcano_frame]['click_mode'] == 'ref') {
          /* update plot: */
          disp_plot(plot_vars[volcano_frame]['data_type'],
                    plot_vars[volcano_frame]['start_index'], plot_vars[volcano_frame]['end_index'],
                    plot_vars[volcano_frame]['ts_area'],
                    [sel_y0, sel_y1, sel_x0, sel_x1]);
        /* if current click mode is points to plot selecting: */
        } else if (plot_vars[volcano_frame]['click_mode'] == 'select') {
          /* update plot: */
          disp_plot(plot_vars[volcano_frame]['data_type'],
                    plot_vars[volcano_frame]['start_index'], plot_vars[volcano_frame]['end_index'],
                    [sel_y0, sel_y1, sel_x0, sel_x1],
                    plot_vars[volcano_frame]['ref_area']);
        };
      };
      /* make sure slected pixel and reference area are still 'selected',
         i.e. visible, after area selection: */
      var heatmap_data_update = {
        selectedpoints: [null, null, 0, 0]
      };
      Plotly.update(heatmap_div, heatmap_data_update, {});
    });

  /* heatmap plot exists. if updating: */
  } else if (update_heatmap_data_type == true ||
             update_heatmap_data_range == true ||
             update_ref_data == true) {
    /* heatmap data update: */
    var heatmap_data_update = {
      x: [x_indexes, ref_x, ts_x],
      y: [y_indexes, ref_y, ts_y],
      z: [z_data, null, null, null, null],
      zmin: [z_min, null, null, null, null],
      zmax: [z_max, null, null, null, null],
      colorbar: [heatmap_colorbar, null, null, null, null],
      colorscale: [heatmap_colorscale, null, null, null, null],
      text: [hover_data, 'reference_area', 'selected pixel', null, null]
    };
    /* heatmap layout update: */
    var heatmap_layout_update = {
      title: {
        text: heatmap_title,
        x: 0.04,
        y: 0.96
      }
    };
    /* perform the update: */
    Plotly.update(heatmap_div, heatmap_data_update, heatmap_layout_update);
  /* end if updating heatmap plot: */
  };

  /* if just updating selected pixel: */
  if (update_ts_data == true && update_heatmap_data_type == false &&
      update_heatmap_data_range == false && update_ref_data == false) {
    /* heatmap data update: */
    var heatmap_data_update = {
      x: [x_indexes, ref_x, ts_x],
      y: [y_indexes, ref_y, ts_y],
    };
    /* heatmap layout update: */
    var heatmap_layout_update = {
    };
    /* perform the update: */
    Plotly.update(heatmap_div, heatmap_data_update, heatmap_layout_update);
  };

  /* if time series is being updated: */
  if (update_ts_data == true || update_ref_data == true) {
    /* check for stored values: */
    if (plot_vars[volcano_frame]['ts_data'][range_key][ts_key] == undefined) {
      /* get start and end data: */
      var start_data_raw = disp_data_raw[start_index];
      var end_data_raw = disp_data_raw[end_index];
      /* get reference area data: */
      var ts_ref_mean_raw = get_area_mean(ref_area, start_data_raw);
      var ts_ref_minus_raw = get_area_mean(ts_area,  start_data_raw) - ts_ref_mean_raw;
      /* init vars for data: */
      var ts_data_raw = [];
      /* have loop through time series to get values: */
      for (var i = start_index; i < end_index + 1; i++) {
        /* raw data value: */
        value_raw = get_area_mean(ts_area, disp_data_raw[i]);
        /* ref area mean: */
        ref_mean_raw = get_area_mean(ref_area, disp_data_raw[i]);
        /* value is data value - ref area mean for time step - ref area mean
           for start data: */
        value_raw_out = value_raw - ref_mean_raw - ts_ref_minus_raw;
        /* add to ts data: */
        ts_data_raw.push(value_raw_out);
      /* end loop through time series: */
      };
      /* store values: */
      plot_vars[volcano_frame]['ts_data'][range_key][ts_key] = {};
      plot_vars[volcano_frame]['ts_data'][range_key][ts_key]['raw'] = ts_data_raw;
    /* end if no stored values: */
    } else {
      /* use stored values: */
      var ts_data_raw = plot_vars[volcano_frame]['ts_data'][range_key][ts_key]['raw'];
    };
  /* end if ts update is true: */
  };
  /* store ts data for csv file saving: */
  plot_vars[volcano_frame]['ts_data_raw'] = ts_data_raw;

  /* if there is no time series plot ... : */
  if (plot_vars[volcano_frame]['ts_plot'] == null) {
    /* raw scatter data: */
    var scatter_raw = {
      type: 'scatter',
      name: 'raw data',
      x: date_data.slice(start_index, end_index + 1),
      y: ts_data_raw,
      mode: 'markers',
      marker: {
        color: '#ff6666'
      }
    };
    /* all data for plotting in order of plotting: */
    var ts_data = [scatter_raw];
    /* time series plot layout: */
    var ts_layout = {
      title: {
        text: 'lat : ' + ts_lat + ', lon : ' + ts_lon,
        x: 0.04,
        y: 0.96
      },
      xaxis: {
        title: 'date',
        zeroline: false
      },
      yaxis: {
        title: 'displacement (mm)',
        zeroline: false
      },
      hovermode: 'closest'
    };
    /* time series plot config: */
    var ts_conf = {
      showLink: false,
      linkText: '',
      displaylogo: false,
      modeBarButtonsToRemove: [
        'autoScale2d',
        'lasso2d',
        'toggleSpikelines',
        'select2d'
      ],
      responsive: true
    };
    /* create the plot: */
    var ts_plot = Plotly.newPlot(ts_div, ts_data,
                                 ts_layout, ts_conf);
    /* store plot information: */
    plot_vars[volcano_frame]['ts_plot'] = ts_plot;
  /* time series plot exists ... if just updating: */
  } else if (update_ts_data == true) {
    /* time series data update: */
    var ts_data_update = {
      x: [
        date_data.slice(start_index, end_index + 1),
      ],
      y: [
        ts_data_raw,
      ]
    };
    /* time series layout update: */
    var ts_layout_update = {
      title: 'lat : ' + ts_lat + ', lon : ' + ts_lon,
    };
    /* perform the update: */
    Plotly.update(ts_div, ts_data_update, ts_layout_update);
  /* end if updating ts plot: */
  };
/* end disp_plot function: */
};
