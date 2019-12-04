
var plot_vars = {
  data_type: null,
  start_index: null,
  end_index: null,
  z_min_raw: null,
  z_max_raw: null,
  z_min_filt: null,
  z_max_filt: null,
  ts_y: null,
  ts_x: null,
  heatmap_data: {},
  hover_data: {},
  ts_data: {},
  heatmap_plot: null,
  ts_plot: null
};

function disp_plot(data_type, start_index, end_index, ts_y, ts_x) {

  /* if nothing has changed ... : */
  if (data_type && data_type == plot_vars['data_type'] &&
      start_index && start_index == plot_vars['start_index'] &&
      end_index && end_index == plot_vars['end_index'] &&
      ts_y && ts_y == plot_vars['ts_y'] &&
      ts_x && ts_x == plot_vars['ts_x']) {
    /* return: */
    return;
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

  /* function to get mean value of ref area from a set of data: */
  function get_ref_mean(ref_area, ref_data) {
    /* init mean calculating variables: */
    var ref_sum = 0;
    var ref_count = 0;
    var ref_mean;
    /* loop through ref values, adding to sum if value is good: */
    for (var i = ref_area[0]; i < ref_area[1]; i++) {
      for (var j = ref_area[2]; j < ref_area[3]; j++) {
        if (ref_data[i][j] != 'null') {
          ref_sum += ref_data[i][j];
          ref_count += 1;
        };
      };
    };
    /* claculate mean, or return 0 if no values: */
    if (ref_count > 0) {
      ref_mean = ref_sum / ref_count;
    } else {
      ref_mean = 0;
    };
    return ref_mean;
  };

  /* get plot container divs: */
  var heatmap_div = document.getElementById('heatmap_plot');
  var ts_div = document.getElementById('ts_plot');
  /* buttons: */
//  var button_raw = document.getElementById('data_type_button_raw');
//  var button_filt = document.getElementById('data_type_button_filt');
  /* slider div: */
  var slider_div = document.getElementById('data_range_control');
  var slider_value_div = document.getElementById('data_range_value');

  /* data variables: */
  var x_data = disp_data['x'];
  var y_data = disp_data['y'];
  var date_data = disp_data['dates'];
  var ref_data = disp_data['refarea'];
  var disp_data_raw = disp_data['data_raw'];
  var disp_data_filt = disp_data['data_filt'];
  var coh_data = disp_data['coh'];
  var mask_data = disp_data['mask'];

  /* presume nothing to be updated: */
  var update_heatmap_data_type = false;
  var update_heatmap_data_range = false;
  var update_heatmap_data = false;
  var update_ts_data = false;

  /* get data type value. set default value if not set: */
  var data_type = data_type || plot_vars['data_type'] || 'raw';
  /* data type to be plotted. check if it has changed: */
  if (data_type != plot_vars['data_type']) {
    update_heatmap_data_type = true;
  };
  /* store the value: */
  plot_vars['data_type'] = data_type;

  /* disable button for active data type: */
//  if (data_type == 'raw') {
//    button_raw.setAttribute('disabled', true);
//      button_filt.removeAttribute('disabled');
//  } else {
//    button_raw.removeAttribute('disabled');
//    button_filt.setAttribute('disabled', true);
//  };

  /* init vars for time series indexes: */
  var ts_y, ts_x;
  /* if time series indexes not specified: */
  if (ts_y == null || ts_x == null) {
    /* if time series indexes are also not in plot_vars: */
    if (plot_vars['ts_y'] == null || plot_vars['ts_x'] == null) {
      /* pick a pixel: */
      var ts_indexes = get_ts_indexes()
      ts_y = ts_indexes[0];
      ts_x = ts_indexes[1];
      /* time series data is updating: */
      update_ts_data = true;
    } else {
      /* use values from plot_vars: */
      ts_y = plot_vars['ts_y'];
      ts_x = plot_vars['ts_x'];
    };
  };
  /* check if time series indexes have changed: */
  if (ts_y != plot_vars['ts_y'] || ts_x != plot_vars['ts_x']) {
      /* time series data is updating: */
      update_ts_data = true;
      /* store new values: */
      plot_vars['ts_y'] = ts_y;
      plot_vars['ts_x'] = ts_x;
  };
  /* ts lat and lon values: */
  var ts_lat = y_data[ts_y];
  var ts_lon = x_data[ts_x];
  /* key for this time series: */
  var ts_key = ts_y + '_' + ts_x;

  /* get start and indexes. check if values have updated: */
  if (start_index == null || end_index == null ||
      start_index != plot_vars['start_index'] ||
      end_index != plot_vars['end_index']) {
    /* set data range to be updated: */
    update_heatmap_data_range = true;
    /* also need to recalculate time series: */
    update_ts_data = true;
  };
  /* start index value: */
  if (start_index == null) {
    if (plot_vars['start_index'] == null) {
      var start_index = 0;
    } else {
      var start_index = plot_vars['start_index'];
    };
  } else {
    var start_index = start_index;
  };
  /* end index value: */
  if (end_index == null) {
    if (plot_vars['end_index'] == null) {
      var end_index = date_data.length - 1;
    } else {
      var end_index = plot_vars['end_index'];
    };
  } else {
    var end_index = end_index;
  };
  /* store start / end index values: */
  plot_vars['start_index'] = start_index;
  plot_vars['end_index'] = end_index;
  /* key for this range in data: */
  var range_key = start_index + '_' + end_index;
  /* create key for storing time series data: */
  if (plot_vars['ts_data'][range_key] == undefined) {
    plot_vars['ts_data'][range_key] = {};
  };

  /* if slider does not exist: */
  if (slider_div.noUiSlider == undefined) {
    /* range min and max values: */
    var slider_range_min = 0;
    var slider_range_max = date_data.length -1;
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
      disp_plot(null, slider_start_index, slider_end_index);
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
  var z_data_masked_raw, z_data_masked_filt, hover_data_raw, hover_data_filt;
  /* if data range is changed ... : */
  if (update_heatmap_data_range == true) {
    /* if data for this range does not exist in plot_vars: */
    if (plot_vars['heatmap_data'][range_key] == undefined ||
        plot_vars['hover_data'][range_key] == undefined) {
      /* get start and end data: */
      var start_data_raw = disp_data_raw[start_index];
      var end_data_raw = disp_data_raw[end_index];
      var start_data_filt = disp_data_filt[start_index];
      var end_data_filt = disp_data_filt[end_index];
      /* need to calculate: */
      update_heatmap_data = true;
    } else {
      /* z_data from stored values: */
      z_data_masked_raw = plot_vars['heatmap_data'][range_key]['raw'];
      z_data_masked_filt = plot_vars['heatmap_data'][range_key]['filt'];
      /* hover data: */
      hover_data_raw = plot_vars['hover_data'][range_key]['raw'];
      hover_data_filt = plot_vars['hover_data'][range_key]['filt'];
      /* no need to recalculate: */
      update_heatmap_data = false;
    };
  };

  /* if data range has changed: */
  if (update_heatmap_data == true) {
    /* get reference area data. arrays of x an y values: */
    var ref_y = [];
    var ref_x = [];
    /* raw data mean valculating values: */
    var ref_sum_raw = 0;
    var ref_count_raw = 0;
    var ref_mean_raw;
    /* filtered data mean valculating values: */
    var ref_sum_filt = 0;
    var ref_count_filt = 0;
    var ref_mean_filt;
    /* spin through ref area indexes: */
    for (var i = ref_data[0]; i < ref_data[1]; i++) {
      for (var j = ref_data[2]; j < ref_data[3]; j++) {
        /* store lat and lon values: */
        ref_y.push(y_data[i]);
        ref_x.push(x_data[j]);
        /* if raw data value is valid, add it to the sum: */
        if (end_data_raw[i][j] != 'null' && start_data_raw[i][j] != 'null') {
          ref_sum_raw += end_data_raw[i][j] - start_data_raw[i][j];
          ref_count_raw += 1;
        };
        /* if filtered data value is valid, add it to the sum: */
        if (end_data_filt[i][j] != 'null' && start_data_filt[i][j] != 'null') {
          ref_sum_filt += end_data_filt[i][j] - start_data_filt[i][j];
          ref_count_filt += 1;
        };
      };
    };
    /* calculate mean for raw values: */
    if (ref_count_raw > 0) {
      ref_mean_raw = ref_sum_raw / ref_count_raw;
    } else {
      ref_mean_raw = 0;
    };
    /* calculate mean for filtered values: */
    if (ref_count_filt > 0) {
      ref_mean_filt = ref_sum_filt / ref_count_filt;
    } else {
      ref_mean_filt = 0;
    };
    /* init variables for raw data: */
    z_data_raw = [];
    var z_data_masked_raw = [];
    var z_values_raw = [];
    var hover_data_raw = [];
    /* init variables for filtered data: */
    z_data_filt = [];
    var z_data_masked_filt = [];
    var z_values_filt = [];
    var hover_data_filt = [];
    /* spin through data. for each column: */
    for (var i = 0; i < end_data_raw.length; i++) {
      /* create variables for this row ... raw values ... : */
      z_data_raw[i] = [];
      z_data_masked_raw[i] = [];
      hover_data_raw[i] = [];
      /* ... filtered values: */
      z_data_filt[i] = [];
      z_data_masked_filt[i] = [];
      hover_data_filt[i] = [];
      /* for each row: */
      for (var j = 0; j < end_data_raw[0].length; j++) {
        /* calculate raw data value. if istart / end values are not null: */
        if (end_data_raw[i][j] == 'null' || start_data_raw[i][j] == 'null') {
          z_data_raw[i][j] = 'null';
        } else {
          z_data_raw[i][j] = ((end_data_raw[i][j] - start_data_raw[i][j])
                              - ref_mean_raw).toFixed(2);
        };
        /* calculate filtered data value: */
        if (end_data_filt[i][j] == 'null' || start_data_filt[i][j] == 'null') {
          z_data_filt[i][j] = 'null';
        } else {
          z_data_filt[i][j] = ((end_data_filt[i][j] - start_data_filt[i][j])
                               - ref_mean_filt).toFixed(2);
        };

        /* if this pixel is maksed ... : */
        if (mask_data[i][j] == 0) {
          /* masked data values: */
          z_data_masked_raw[i][j] = 'null';
          z_data_masked_filt[i][j] = 'null';
          z_label_raw = 'masked';
          z_label_filt = 'masked';
          coh_label = 'masked';
          /* add zeros to lists of raw and filtered values for min / max: */
          z_values_raw.push(0);
          z_values_filt.push(0);
        } else {
          /* else, we have 'good' values: */
          z_data_masked_raw[i][j] = z_data_raw[i][j];
          z_data_masked_filt[i][j] = z_data_filt[i][j];
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
          if (z_data_filt[i][j] != 'null') {
            /* add to values for min / max calculating: */
            z_values_filt.push(z_data_filt[i][j]);
            /* set hover label: */
            z_label_filt = z_data_filt[i][j] + ' mm';
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
        /* filtered hover data values: */
        hover_data_filt[i][j] = 'lat : ' + y_data[i] + '<br>' +
                                'lon : ' + x_data[j] + '<br>' +
                                'displacement : ' + z_label_filt + '<br>' +
                                'coherence : ' + coh_label;
      /* end for j: */
      };
    /* end for i: */
    };

    /* store caculated values; */
    plot_vars['heatmap_data'][range_key] = {};
    plot_vars['heatmap_data'][range_key]['raw'] = z_data_masked_raw;
    plot_vars['heatmap_data'][range_key]['filt'] = z_data_masked_filt;
    plot_vars['hover_data'][range_key] = {};
    plot_vars['hover_data'][range_key]['raw'] = hover_data_raw;
    plot_vars['hover_data'][range_key]['filt'] = hover_data_filt;

    /* if z min or max values are not set: */
    if (plot_vars['z_min_raw'] == null ||
        plot_vars['z_max_raw'] == null ||
        plot_vars['z_min_filt'] == null ||
        plot_vars['z_max_filt'] == null) {
      /* sort z values: */
      z_values_raw.sort(function num_cmp(a, b) {
        return a - b;
      });
      z_values_filt.sort(function num_cmp(a, b) {
        return a - b;
      });
      /* calculate min and max values at 1st and 99th percentiles. raw: */
      var z_min_raw = z_values_raw[Math.ceil((z_values_raw.length / 100)
                                             * 1)];
      var z_max_raw = z_values_raw[Math.floor((z_values_raw.length / 100)
                                              * 99)];
      plot_vars['z_min_raw'] = z_min_raw;
      plot_vars['z_max_raw'] = z_max_raw;
      /* filtered: */
      var z_min_filt = z_values_filt[Math.ceil((z_values_filt.length / 100)
                                               * 1)];
      var z_max_filt = z_values_filt[Math.floor((z_values_filt.length / 100)
                                                * 99)];
      plot_vars['z_min_filt'] = z_min_filt;
      plot_vars['z_max_filt'] = z_max_filt;
    };

  /* end if data range has changed: */
  };

  /* if heatmap plotting: */
  if (update_heatmap_data_type || update_heatmap_data_range) {
    /* get data for plotting: */
    var z_data, z_min, z_max, hover_data;
    if (data_type == 'raw') {
      z_data = z_data_masked_raw;
      z_min = plot_vars['z_min_raw'];
      z_max = plot_vars['z_max_raw'];
      hover_data = hover_data_raw;
    } else {
      z_data = z_data_masked_filt;
      z_min = plot_vars['z_min_filt'];
      z_max = plot_vars['z_max_filt'];
      hover_data = hover_data_filt;
    };
  };

  /* if there is no heatmap plot ... : */
  if (plot_vars['heatmap_plot'] == null) {
    /* set up the heatmap plot data: */
    var heatmap_disp = {
      type: 'heatmap',
      x: x_data,
      y: y_data,
      z: z_data,
      zmin: z_min,
      zmax: z_max,
      colorscale: [
        [0, 'rgb(26, 51, 153)'],
        [0.25, 'rgb(72, 152, 197)'],
        [0.5, 'rgb(204, 235, 200)'],
        [0.75, 'rgb(192, 159, 58)'],
        [1, 'rgb(127, 25, 0)']
      ],
      colorbar: {
        title: 'displacement (mm)',
        titleside: 'right'
      },
      hoverinfo: 'text',
      text: hover_data
    };

    /* scatter plot of ref area: */
    var heatmap_ref = {
      type: 'scatter',
      x: ref_x,
      y: ref_y,
      marker: {
        color: '#ff0000',
      },
      hoverinfo: 'text',
      text: 'reference area'
    };

    /* scatter plot of selected pixel: */
    var heatmap_selected = {
      type: 'scatter',
      x: [x_data[ts_x]],
      y: [y_data[ts_y]],
      marker: {
        color: '#00ff00',
      },
      hoverinfo: 'text',
      text: 'selected pixel'
    };

    /* heatmap layout: */
    var heatmap_layout = {
      title: 'displacement',
      xaxis: {
        title: 'longitude',
        range: [x_data[0], x_data.slice(-1)[0]],
        zeroline: false,
        autorange: true,
        scaleanchor: 'y',
        scaleratio: 1,
        constrain: 'domain'
      },
      yaxis: {
        title: 'latitude',
        range: [y_data[0], y_data.slice(-1)[0]],
        zeroline: false,
        autorange: true,
        constrain: 'domain'
      },
      hovermode: 'closest',
      showlegend: false
    };

    /* heatmap config: */
    var heatmap_conf = {
      showLink: false,
      linkText: '',
      displaylogo: false,
      responsive: true
    };

    /* data, in order of plotting: */
    var heatmap_data = [heatmap_disp, heatmap_ref, heatmap_selected];
    /* create a new plot: */
    var heatmap_plot = Plotly.newPlot(heatmap_div, heatmap_data,
                                      heatmap_layout, heatmap_conf);
    /* store the plot information in plot_vars: */
    plot_vars['heatmap_plot'] = heatmap_plot;

    /* add on click functionality: */
    heatmap_div.on('plotly_click', function(data){
      /* x and y indexes from data: */
      var click_y = data.points[0]['pointNumber'][0];
      var click_x = data.points[0]['pointNumber'][1];
      /* give up if either is not defined: */
      if (click_y == undefined || click_x == undefined) {
        return;
      };

      /* x and y values of clicked point: */
      var click_y_val = data.y;
      var click_x_val = data.x;

      /* don't do anything if this is a masked pixel: */
      if (mask_data[click_y][click_x] == 0) {
        {};
      /* don't do anything if this the currently selected pixel: */
      } else if (click_y == ts_y && click_x == ts_x) {
        {};
      /* don't do anything if this is the reference area: */
      } else if (ref_y.indexOf(click_y_val) > -1 &&
                 ref_x.indexOf(click_x_val) > -1) {
        {};
      /* otherwise, update the time series plot: */
      } else {
        disp_plot(plot_vars['data_type'], null, null, click_y, click_x);
      };
    });
  /* heatmap plot exists. if updating: */
  } else if (update_heatmap_data_type == true ||
             update_heatmap_data_range == true) {
    /* heatmap data update: */
    var heatmap_data_update = {
      z: [z_data, null, null],
      zmin: [z_min, null, null],
      zmax: [z_max, null, null],
      text: [hover_data, 'reference_area', 'selected pixel']
    };
    /* heatmap layout update: */
    var heatmap_layout_update = {
    };
    /* perform the update: */
    Plotly.update(heatmap_div, heatmap_data_update, heatmap_layout_update);
  /* end if updating heatmap plot: */
  };

  /* if just updating selected pixel: */
  if (update_ts_data == true) {
    /* heatmap data update: */
    var heatmap_data_update = {
      x: [x_data, ref_x, [x_data[ts_x]]],
      y: [y_data, ref_y, [y_data[ts_y]]],
    };
    /* heatmap layout update: */
    var heatmap_layout_update = {
    };
    /* perform the update: */
    Plotly.update(heatmap_div, heatmap_data_update, heatmap_layout_update);
  };

  /* if time series is being updated: */
  if (update_ts_data == true) {
    /* check for stored values: */
    if (plot_vars['ts_data'][range_key][ts_key] == undefined) {
      /* get start and end data: */
      var start_data_raw = disp_data_raw[start_index];
      var end_data_raw = disp_data_raw[end_index];
      var start_data_filt = disp_data_filt[start_index];
      var end_data_filt = disp_data_filt[end_index];
      /* get reference area data: */
      var ts_ref_mean_raw = get_ref_mean(ref_data, start_data_raw);
      var ts_ref_minus_raw = start_data_raw[ts_y][ts_x] - ts_ref_mean_raw;
      var ts_ref_mean_filt = get_ref_mean(ref_data, start_data_filt);
      var ts_ref_minus_filt = start_data_filt[ts_y][ts_x] - ts_ref_mean_filt;
      /* init vars for data: */
      var ts_data_raw = [];
      var ts_data_filt = [];
      /* init variables for regression: */
      var ts_matrix_raw = [];
      var ts_matrix_filt = [];

      /* calculate date range length for regressing: */
      var regress_start_date = Date.parse(date_data[start_index]) / 1000;
      var regress_end_date = Date.parse(date_data[end_index]) / 1000;
      var regress_date_range = regress_end_date - regress_start_date; 
      /* init count for regression indexes: */
      var index_count = 0;
      /* have loop through time series to get values: */
      for (var i = start_index; i < end_index + 1; i++) {
        /* raw data value: */
        value_raw = disp_data_raw[i][ts_y][ts_x];
        /* ref area mean: */
        ref_mean_raw = get_ref_mean(ref_data, disp_data_raw[i]);
        /* value is data value - ref area mean for time step - ref area mean
           for start data: */
        value_raw_out = value_raw - ref_mean_raw - ts_ref_minus_raw;
        /* add to ts data: */
        ts_data_raw.push(value_raw_out);
        /* raw data value: */
        value_filt = disp_data_filt[i][ts_y][ts_x];
        /* ref area mean: */
        ref_mean_filt = get_ref_mean(ref_data, disp_data_filt[i]);
        /* value is data value - ref area mean for time step - ref area mean
           for start data: */
        value_filt_out = value_filt - ref_mean_filt - ts_ref_minus_filt;
        /* add to ts data: */
        ts_data_filt.push(value_filt_out);
        /* need date for regression: */
        var regress_date = Date.parse(date_data[i]) / 1000;
        /* normalise value: */
        var regress_x = (regress_date - regress_start_date) /
                         regress_date_range;
        /* update regression data: */
        ts_matrix_raw[index_count] = [regress_x, ts_data_raw[index_count]];
        ts_matrix_filt[index_count] = [regress_x, ts_data_filt[index_count]];
        /* increment the count: */
        index_count++;
      /* end loop through time series: */
      };

      /* calculate linear fit: */
      var ts_linear_raw = regression.linear(ts_matrix_raw).points;
      var ts_linear_filt = regression.linear(ts_matrix_filt).points;
      /* extract y values from regression output: */
      var ts_fit_raw = ts_linear_raw.map(function(value, index) {
                         return value[1];
                       });
      var ts_fit_filt = ts_linear_filt.map(function(value, index) {
                          return value[1];
                        });
      /* store values: */
      plot_vars['ts_data'][range_key][ts_key] = {};
      plot_vars['ts_data'][range_key][ts_key]['raw'] = ts_data_raw;
      plot_vars['ts_data'][range_key][ts_key]['filt'] = ts_data_filt;
      plot_vars['ts_data'][range_key][ts_key]['fit_raw'] = ts_fit_raw;
      plot_vars['ts_data'][range_key][ts_key]['fit_filt'] = ts_fit_filt;
    /* end if no stored values: */
    } else {
      /* use stored values: */
      var ts_data_raw = plot_vars['ts_data'][range_key][ts_key]['raw'];
      var ts_data_filt = plot_vars['ts_data'][range_key][ts_key]['filt'];
      var ts_fit_raw = plot_vars['ts_data'][range_key][ts_key]['fit_raw'];
      var ts_fit_filt = plot_vars['ts_data'][range_key][ts_key]['fit_filt'];
    };
  /* end if ts update is true: */
  };

  /* if there is no time series plot ... : */
  if (plot_vars['ts_plot'] == null) {
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
    /* raw data linear fit: */
    var scatter_fit_raw = {
      type: 'scatter',
      name: 'linear fit',
      x: [date_data[start_index], date_data[end_index]],
      y: [ts_fit_raw[0], ts_fit_raw.slice(-1)[0]],
      mode: 'lines',
      marker: {
        color: '#ff6666'
      },
      hoverinfo: 'none'
    };
    /* filtered data: */
    var scatter_filt = {
      type: 'scatter',
      name: 'filtered data',
      x: date_data.slice(start_index, end_index + 1),
      y: ts_data_filt,
      mode: 'markers',
      marker: {
        color: '#6666ff'
      }
    };
    /* filtered data linear fit: */
    var scatter_fit_filt = {
      type: 'scatter',
      name: 'linear fit',
      x: [date_data[start_index], date_data[end_index]],
      y: [ts_fit_filt[0], ts_fit_filt.slice(-1)[0]],
      mode: 'lines',
      line: {
        color: '#6666ff'
      },
      hoverinfo: 'none'
    };
    /* all data for plotting in order of plotting: */
//    var ts_data = [scatter_raw, scatter_fit_raw,
//                   scatter_filt, scatter_fit_filt];
    var ts_data = [scatter_raw];
    /* time series plot layout: */
    var ts_layout = {
      title: 'lat : ' + ts_lat + ', lon : ' + ts_lon,
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
      responsive: true
    };
    /* create the plot: */
    var ts_plot = Plotly.newPlot(ts_div, ts_data,
                                 ts_layout, ts_conf);
    /* store plot information: */
    plot_vars['ts_plot'] = ts_plot;
  /* time series plot exists ... if just updating: */
  } else if (update_ts_data == true) {
    /* time series data update: */
    var ts_data_update = {
      x: [
        date_data.slice(start_index, end_index + 1),
//        [date_data[start_index], date_data[end_index]],
//        date_data.slice(start_index, end_index + 1),
//        [date_data[start_index], date_data[end_index]]
      ],
      y: [
        ts_data_raw,
//        [ts_fit_raw[0], ts_fit_raw.slice(-1)[0]],
//        ts_data_filt,
//        [ts_fit_filt[0], ts_fit_filt.slice(-1)[0]]
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

/* on page load: */
window.addEventListener('load', function() {
  /* plot!: */
  disp_plot();
});

