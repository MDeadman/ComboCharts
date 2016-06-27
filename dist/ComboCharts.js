/*__________________________________________________________
|                                              __           |
|                _   /\                 ____  /  \/\    ____|
|               / \_/  \               /    \/      \__/    |
|              /        COMBO CHARTS  /                     |
|   ___       /            v0.1               __  /\        |
|  /   \     /        Matthew Deadman        /  \/  \       |
|_/    _\___/  Charting Library based on d3.js       \      |
|   __/  \       / \        \     /        /          \     |
|  /      \__   /   \___/\   \___/___    _/            \    |
| /          \_/          \   __/    \__/               \___|
|/                         \_/                              |
|__________________________________________________________*/



'use strict';

var ComboChart = {
  version: '0.1'
}

ComboChart.ChartArea = function (elementId, options) {

  //Chart Element
  var chartElement = document.getElementById(elementId);

  //User Options ------------------------------------------------------------------------
  var options = options || {};

  //Size and spacing
  var padding = options.padding || 60;
  var width = options.width || 400;
  var height = options.height || 600;

  //Set the axes font
  var font = options.font || 'arial, sans-serif';

  //Whether the Grid lines will be shown or not
  var xGridEnabled = options.xGridEnabled || true;
  var yGridEnabled = options.yGridEnabled || true;

  //Scale of the axis
  //Options ('linear', 'time', 'sqrt', 'pow', 'log')
  var xScaleType = options.xScaleType || 'linear';
  var yScaleType = options.yScaleType || 'linear';

  //Whether zoom will be enabled or not
  var zoomEnabled = options.zoomEnabled || false;

  //Create Chart Area -------------------------------------------------------------------

  //Svg containting all components of the chart
  var fullArea = d3.select(chartElement).append('svg')
    .attr('width', width)
    .attr('height', height);

  // Plot Area 
  var plotWidth = width - padding;
  var plotHeight = height - padding;

  //Domain of chartarea 
  //[X axis min value, X axis max value, Y axis min value, Y axxis max value]
  var domain = [];

  //Scales
  var xScale = updateScaleType(xScaleType)
    .domain([domain[0], domain[1]])
    .range([padding, plotWidth]);
  var yScale = updateScaleType(yScaleType)
    .domain([domain[2], domain[3]])
    .range([plotHeight, padding]);

  //Creating X and Y Axis 
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .innerTickSize(-(plotHeight - padding))
    .outerTickSize(0);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .innerTickSize(-(plotWidth - padding))
    .outerTickSize(0);

  //Append axis to fullArea
  var plotXAxis = fullArea.append('g')
    .attr('transform', 'translate(0,' + plotHeight + ')')
    .call(xAxis)
    .style({
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'font-family': font,
      'font-size': '12px'
    });

  var plotYAxis = fullArea.append('g')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis)
    .style({
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'font-family': font,
      'font-size': '12px'
    });

  //Append and create cliparea
  var plotArea = fullArea.append('g')
    .attr('clip-path', 'url(#ccLinePlotAreaClip)');

  var plotAreaClip = plotArea.append('clipPath')
    .attr('id', 'ccLinePlotAreaClip')
    .append('rect')
    .attr('x', padding)
    .attr('y', padding)
    .attr('width', plotWidth - padding)
    .attr('height', plotHeight - padding);

  plotArea.append('rect')
    .attr('x', padding)
    .attr('y', padding)
    .attr('width', plotWidth - padding)
    .attr('height', plotHeight - padding)
    .attr('stroke', '#dbdbdb')
    .attr('stroke-width', 2)
    .attr('fill', '#ff0000')
    .attr('fill-opacity', 0);

  //Variables ---------------------------------------------------------------------------

  //Store chart update functions 
  var chartLayers = [];

  //Store selected data
  var selectedData = [];

  //Store domainUpdate functions from charts
  var chartDomains = [];


  // Public methods ---------------------------------------------------------------------

  //Returns doamin
  this.getDomain = function () {
    return domain;
  }

  //Returns the currently selected data
  this.getSelectedData = function () {
    return selectedData;
  }


  //Functions ---------------------------------------------------------------------------

  //Create scale given a minimum and maximum value and scale type
  function updateScaleType(scaleType) {
    var scale;
    switch (scaleType) {
    case 'linear':
      var scale = d3.scale.linear()
      break;
    case 'time':
      var scale = d3.time.scale()
      break;
    case 'sqrt':
      var scale = d3.scale.sqrt()
      break;
    case 'pow':
      var scale = d3.scale.pow()
      break;
    case 'log':
      var scale = d3.scale.log()
      break;
    }
    return scale;
  }

  //Adds the domain update function from created chart to chartDomains and returns the index 
  function addDomainToChartDomains(domainUpdate, data) {
    chartDomains.push([domainUpdate, data]);
    return chartDomains.length - 1;
  }

  //Check if a domain extends beyond the current charts domains and updates the chartarea domain
  //If a domain and index are passed in the update domain function at Index will be overwritten will the newDomain value
  function updateDomain(newDomain, index) {
    var retDomain = [];
    for (var i = 0; i < chartDomains.length; i++) {
      var domainValue;
      if (index != undefined && i == index) {
        domainValue = newDomain;
      } else {
        domainValue = chartDomains[i][0](chartDomains[i][1]);
      }
      for (var a = 0; a < 4; a++) {
        if (a % 2 == 0) {
          if (retDomain[a] == undefined || retDomain[a] > domainValue[a]) {
            retDomain[a] = domainValue[a];
          }
        } else {
          if (retDomain[a] == undefined || retDomain[a] < domainValue[a]) {
            retDomain[a] = domainValue[a];
          }
        }
      }
    }
    return retDomain;
  }

  //Updates chartarea x and y scale variables with chart area domain
  function updateScales() {
    xScale = updateScaleType(xScaleType)
      .domain([domain[0], domain[1]])
      .range([padding, plotWidth]);
    yScale = updateScaleType(yScaleType)
      .domain([domain[2], (domain[3] * 1.15)])
      .range([plotHeight, padding]);
  }

  //Update axes and scale variables and redraw, check if x axis labels overlap and if they do rotate them
  function redrawAxes() {
    xAxis.scale(xScale)
    yAxis.scale(yScale)

    plotXAxis.call(xAxis);
    plotYAxis.call(yAxis);

    plotXAxis.selectAll('line').style({
      'fill': 'none',
      'stroke': '#dbdbdb',
      'shape-rendering': 'crispEdges'
    })

    var lastBBox;
    var rotateLabels = false;

    plotXAxis.selectAll('text').style({
        'text-anchor': 'middle'
      })
      .attr('transform', 'rotate(0)');

    plotXAxis.selectAll('text').each(function () {

      var currentBBox = this.getBoundingClientRect();

      if (lastBBox == undefined) {
        lastBBox = currentBBox;
      } else if (lastBBox.right > currentBBox.left - 2) {
        rotateLabels = true;
        return false;
      } else {
        lastBBox = currentBBox;
      }
    });

    if (rotateLabels == true) {
      plotXAxis.selectAll('text').style({
          'text-anchor': 'end'
        })
        .attr('dx', '-.2em')
        .attr('dy', '.4em')
        .attr('transform', 'rotate(-65)');
    }

    plotYAxis.selectAll('line').style({
      'fill': 'none',
      'stroke': '#dbdbdb',
      'shape-rendering': 'crispEdges'
    })

  }

  //Add chart update functions to chartLayers array
  function addChartUpdateToRedrawCharts(chartDraw) {
    if (chartLayers.length == 0) {
      chartLayers.push(chartDraw);
    } else {
      for (var a = 0; a <= chartLayers.length; a++) {
        if (a == chartLayers.length || chartLayers[a][1] > chartDraw[1]) {
          chartLayers.splice(a, 0, chartDraw);
          break;
        }
      }
    }
  }

  //Run all chart update functions in chartLayers array
  function redrawCharts(data) {
    for (var a = 0; a < chartLayers.length; a++) {
      chartLayers[a][0](data);
    }
  }

  /* Line Chart ---------------------------------------------------------------------- *
     
   
   * --------------------------------------------------------------------------------- */
  this.createLineChart = function (lineOptions) {
    //User Options ----------------------------------------------------------------------
    var lineOptions = lineOptions || {};

    /*Data structure
                           Further data points can be passed 
                           in to graph in companion graphs or
    Line   Data Point      graph totals/comparisons/etc
      ↓   ↙                          ↓↓
    [ [  [xValue, yValue(, optional extra y values)], [dataPoint2] ], [line2], [etc...] ]  */
    var data = lineOptions.data || [[[]]]

    //Color/labels for line of matching index
    var colors = lineOptions.colors || ['#e21f1f', '#0b5ed0', '#1b7e09', '#a10dce', '#e26d09'];
    var labels = lineOptions.labels || ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];

    //Specifies how data should be graphed if more then one y value is entered
    //Options ('total', more to come...)
    var dataType = lineOptions.dataType || 'total';

    //Set the style of the data points
    //Options ('dot', 'doughnut', 'none')
    var pointStyle = lineOptions.pointStyle || 'dot';

    //Set line interpolations type
    //Options - all d3 interpolation types
    var interpolation = lineOptions.interpolation || 'linear';

    //If set to true will draw the area beneath each line
    var showArea = lineOptions.showArea || false;

    //Set the layer which determines which order to draw each chart in 
    //ie which charts are on top of which 
    var layer = lineOptions.layer || 1;

    //Enable x line selection tool if true
    var xLineSelectionEnabled = lineOptions.xLineSelection || false;

    //Enable point click selection if true
    var pointSelectionEnabled = lineOptions.pointSelection || false;

    //Enable X cursor line if true
    var xCursorLineEnabled = lineOptions.xCursorLine || false;

    //Enable x position tooltip if true
    var xPosTooltipEnabled = lineOptions.xPosTooltip || false;

    //Parse Data ------------------------------------------------------------------------
    //If line type is total calculate and insert the total value into each data point at index 1 (yValue)
    if (dataType == 'total') {
      for (var a = 0; a < data.length; a++) {
        for (var b = 0; b < data[a].length; b++) {
          var temp = 0;
          for (var c = 1; c < data[a][b].length; c++) {
            temp = temp + data[a][b][c];
          }
          data[a][b].splice(1, 0, temp);
        }
      }
    }

    //If x value is a date
    if (isNaN(data[0][0][0])) {
      //Convert data to date object
      for (var a = 0; a < data.length; a++) {
        for (var b = 0; b < data[a].length; b++) {
          var date = new Date(data[a][b][0]);
          //Set the date as UTC
          date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
          data[a][b][0] = date;
        }
      }
    }

    //Variables -------------------------------------------------------------------------
    //Variables for points and lines
    var xPoint = function (d) {
      return xScale(d[0])
    };
    var yPoint = function (d) {
      return yScale(d[1])
    };

    //Creating Lines Between Points
    var line = d3.svg.line()
      .x(xPoint)
      .y(yPoint)
      .interpolate(interpolation);

    //Stores line values
    var lines = [];

    //Creating areas for lines
    var area = d3.svg.area()
      .x(xPoint)
      .y0(plotHeight)
      .y1(yPoint);

    //Stores area values
    var areas = [];

    //Stores x line selection 
    var xLineSelect;

    //Stores x cursor line
    var xCursorLine;

    //Stores x position tooltip
    var xPosTooltip;

    //Add domain update to chartDomains array
    //Stores index of domain update function for the bar chart in chartDomains array
    var domainUpdateIndex = addDomainToChartDomains(updateLineDomain, data);

    //Draw line chart -------------------------------------------------------------------

    //Update chartarea domain and axes and add tooltip behaviour if enabled
    domain = updateDomain();

    updateScales();
    redrawAxes();

    addChartUpdateToRedrawCharts([redrawChart, layer]);

    if (xLineSelectionEnabled)
      xLineSelect = createSelectedLine();

    if (xCursorLineEnabled)
      xCursorLine = createCursorLine();

    if (xPosTooltipEnabled)
      xPosTooltip = createXPosTooltip();

    redrawCharts(data);

    plotArea.on('mouseover', function () {
        if (xCursorLineEnabled) {
          xCursorLine.update(d3.mouse(fullArea.node())[0]);
        }
        if (xPosTooltipEnabled) {
          xPosTooltip.update(d3.mouse(fullArea[0][0]));
        }
      })
      .on('mousemove', function () {
        if (xCursorLineEnabled) {
          xCursorLine.update(d3.mouse(fullArea.node())[0]);
        }
        if (xPosTooltipEnabled) {
          xPosTooltip.update(d3.mouse(fullArea[0][0]));
        }
      })
      .on('mouseout', function () {
        if (xCursorLineEnabled) {
          xCursorLine.hide();
        }
        if (xPosTooltipEnabled) {
          xPosTooltip.hide();
        }
      })
      .on('mousedown', function () {
        if (xLineSelectionEnabled) {
          xLineSelect.update(d3.mouse(fullArea.node())[0]);
        }
      });


    //Functions -------------------------------------------------------------------------

    //Assign value to xDomain and yDomain
    //Find x and y domain (largest x and y value) and 
    function updateLineDomain(data) {
      var domain = [];
      for (var i = 0; i < data.length; i++) {

        var xTemp = d3.extent(data[i], function (d) {
          return d[0]
        });
        if (xTemp[0] < domain[0] || domain[0] == null || domain[0] == undefined) {
          domain[0] = xTemp[0];
        };
        if (xTemp[1] > domain[1] || domain[1] == null || domain[1] == undefined) {
          domain[1] = xTemp[1];
        };

        var yTemp = d3.extent(data[i], function (d) {
          return d[1]
        });
        if (yTemp[0] < domain[2] || domain[2] == null || domain[2] == undefined) {
          domain[2] = yTemp[0];
        };
        if (yTemp[1] > domain[3] || domain[3] == null || domain[3] == undefined) {
          domain[3] = yTemp[1];
        };

      }
      return domain;
    }

    //Assign values to lines
    //Redraw all points and lines onto the chart
    function redrawChart(xdxd) {

      lines = [];

      //Remove Elements
      fullArea.selectAll('path').remove();
      fullArea.selectAll('circle').remove();

      redrawAxes();

      //      if (zoomEnabled) {
      //        //Redraw zoom overlay for each dataset
      //        for (i = 0; i < data.length; i++) {
      //          plotArea.append('path')
      //            .style({
      //              'stroke-width': '0px',
      //              'fill-opacity': '0'
      //            })
      //            .attr('d', zoomOverlayArea(data[i]))
      //            .call(zoom)
      //            .on('dblclick.zoom', null);
      //        }
      //      }

      if (showArea) {
        for (var i = 0; i < data.length; i++) {
          var temp = plotArea.append('svg:path')
            .attr('d', area(data[i]))
            .attr('fill', colors[i])
            .attr('opacity', '0.3');

          areas.push(temp);
        }
      }

      //Redraw paths and points for each dataset
      for (var i = 0; i < data.length; i++) {

        //Variable to store all elements of line so they can be saved to lines variable 
        var temp = [];

        temp[0] = plotArea.append('svg:path')
          .attr('d', line(data[i]))
          .attr('stroke', colors[i])
          .attr('stroke-width', 2)
          .attr('fill', 'none');

        if (pointStyle == 'doughnut') {
          //doughnut style
          //White circle point
          temp[2] = plotArea.selectAll('.set' + i)
            .data(data[i])
            .enter()
            .append('circle')
            .attr('class', 'set' + i)
            .attr('cx', xPoint)
            .attr('cy', yPoint)
            .attr('r', 6)
            .attr('fill', '#fff');

          //Inner point 
          temp[1] = plotArea.selectAll('.inner' + i)
            .data(data[i])
            .enter()
            .append('circle')
            .attr('class', 'inner' + i)
            .attr('cx', xPoint)
            .attr('cy', yPoint)
            .attr('r', 3)
            .attr('fill', '#fff')
            .attr('stroke', colors[i])
            .attr('stroke-width', 2);


        } else if (pointStyle == 'none') {
          //no dot style

        } else {
          //defult to dot styling

          //Inner point 
          temp[1] = plotArea.selectAll('.inner' + i)
            .data(data[i])
            .enter()
            .append('circle')
            .attr('class', 'inner' + i)
            .attr('cx', xPoint)
            .attr('cy', yPoint)
            .attr('r', 3)
            .attr('fill', colors[i])
        }


        //Larger invisble point for tooltip mouse over
        temp[3] = plotArea.selectAll('.tooltipArea' + i)
          .data(data[i])
          .enter()
          .append('circle')
          .attr('class', 'tooltipArea' + i)
          .attr('cx', xPoint)
          .attr('cy', yPoint)
          .attr('r', 10)
          .style('opacity', 0)
          //Tooltip on mouseover
          .on('mouseover', function (d) {
            //          tooltip.style('left', (d3.event.pageX + 10) + 'px')
            //            .style('top', (d3.event.pageY - 25) + 'px')
            //            .html('x: ' + d[0] + '<br/>y: ' + d[1])
            //            .transition().duration(200)
            //            .style('opacity', .9);
          })
          .on('mouseout', function (d) {
            //          tooltip.transition()
            //            .duration(500)
            //            .style('opacity', 0);
          });

        lines.push(temp);
      }
    }

    //Draw vertical line at x value
    function createCursorLine() {
      var cursorLine = plotArea.append('line')
        .style('stroke', 'black')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 0);

      cursorLine.update = function (xPosition) {
        cursorLine
          .style('stroke', '#000')
          .attr('class', 'hoverLine')
          .attr('x1', xPosition)
          .attr('x2', xPosition)
          .attr('y1', padding)
          .attr('y2', plotHeight);
      }

      cursorLine.hide = function () {
        cursorLine
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 0)
          .attr('y2', 0);
      }

      return cursorLine;
    }

    //Draw Line on plotArea
    function createSelectedLine() {
      var selectedLine = plotArea.append('line')
        .style('stroke', 'black')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 0);

      selectedLine.update = function (xPosition) {
        //Find X value of where user clicked
        var selectedXVal = xScale.invert(xPosition)

        //Find value and x position of nearest point
        var closestPoint = findClosestXVal(selectedXVal);
        var closestXVal = xScale(data[closestPoint[1]][closestPoint[2]][0]);

        selectedData = findAllValAtX(data[closestPoint[1]][closestPoint[2]][0]);

        selectedLine
          .style('stroke', '#000')
          .style('stroke-width', 2)
          .attr('x1', closestXVal)
          .attr('x2', closestXVal)
          .attr('y1', padding)
          .attr('y2', plotHeight);
      }
      return selectedLine;
    }

    //Returns array containing x value and the group and point index of said point from data
    //[value, group index, index]
    function findClosestXVal(value) {

      //Value returned [value, group index, index]
      var closestVal = [-1, -1, -1];

      for (var i = 0; i < data.length; i++) {

        var currentClosestVal = [];

        var low = 0;
        var high = data[i].length - 1;
        var mid = Math.floor((low + high) / 2);

        //If value is outside range of current line set it to max or minimum of line
        if (value < data[i][low][0]) {
          currentClosestVal = [((value - data[i][low][0]) * -1), i, low];
        } else if (value > data[i][high][0]) {
          currentClosestVal = [value - data[i][high][0], i, high];
        } else {

          //Binary search for closest value above and below the inputted value
          while ((high - low) > 1) {
            mid = Math.floor((low + high) / 2);
            if ((value - data[i][mid][0]) > 0) {
              low = mid;
            } else if ((value - data[i][mid][0]) < 0) {
              high = mid;
            } else if ((value - data[i][mid][0]) == 0) {
              return closestVal = [(value - data[i][mid][0]), i, mid];
            }
          }

          //If one of the numbers matches perfectly return that num and exit
          if ((value - data[i][low][0]) == 0) {
            return closestVal = [(value - data[i][low][0]), i, low];
          } else if (((value - data[i][high][0]) * -1) == 0) {
            return closestVal = [(value - data[i][high][0]), i, high];
          }

          //Set the current closest value
          if ((value - data[i][low][0]) < ((value - data[i][high][0]) * -1)) {
            currentClosestVal = [(value - data[i][low][0]), i, low];
          } else {
            currentClosestVal = [((value - data[i][high][0]) * -1), i, high];
          }
        }
        //if the current closest value is the closest so far set it as such 
        if (currentClosestVal[0] < closestVal[0] || closestVal[0] == -1)
          closestVal = currentClosestVal;

      }
      return closestVal;
    }

    //Find and return all data points at specified x value
    function findAllValAtX(xValue) {
      var values = [];

      for (var i = 0; i < data.length; i++) {

        var low = -1;
        var high = data[i].length;
        var mid = Math.floor((low + high) / 2);

        //Binary search for matching value
        while ((high - low) > 1) {
          mid = Math.floor((low + high) / 2);
          if ((xValue - data[i][mid][0]) > 0) {

            low = mid;
          } else if ((xValue - data[i][mid][0]) < 0) {
            high = mid;
          } else if ((xValue - data[i][mid][0]) == 0) {
            //El classico slice n splice
            var temp = data[i][mid].slice()
            temp.splice(1, 1)
            values.push(temp);
            break;
          }
        }
      }
      return values;
    }

    //Find and return all data points at specified x value
    function findAllIndexAtX(xValue) {
      var values = [];

      for (var i = 0; i < data.length; i++) {

        var low = -1;
        var high = data[i].length;
        var mid = Math.floor((low + high) / 2);

        //Binary search for matching value
        while ((high - low) > 1) {
          mid = Math.floor((low + high) / 2);
          if ((xValue - data[i][mid][0]) > 0) {

            low = mid;
          } else if ((xValue - data[i][mid][0]) < 0) {
            high = mid;
          } else if ((xValue - data[i][mid][0]) == 0) {
            //El classico slice n splice
            var temp = [[i], [mid]]
            values.push(temp);
            break;
          }
        }
      }
      return values;
    }


    //Tooltips --------------------------------------------------------------------------
    //Create tooltip showing data for point closest to mouse posititon for each group
    function createXPosTooltip() {

      //Create tooltip div
      var tooltip = d3.select('body').append('div')
        .style({
          'display': 'flex',
          'flex-direction': 'row',
          'position': 'absolute',
          'z-index': '10',
          'opacity': 0,
          'font': '12px sans-serif',
          'text-align': 'left',
          'padding': '4px',
          'padding-left': '6px',
          'padding-right': '0px',
          'border-radius': '5px',
          'width': 'auto',
          'height': 'auto',
          'background': '#fff',
          'pointer-events': 'none',
          'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          'border': '1px solid rgba(0, 0, 0, 0.24)'
        });

      //Area within tooltip for color boxes
      var tooltipColorArea = tooltip.append('div')
        .style({
          'z-index': '11',
          'text-align': 'left',
          'width': 'auto', //10
          'height': 'auto', //40
          'padding-top': '14px',
          'background': '#fff',
          'border': '0px solid green',
          'pointer-events': 'none'
        })
        .append('svg')
        .style('margin-top', '1px')
        .attr('width', '10px');

      //Area within tooltip for text
      var tooltipTextArea = tooltip.append('div')
        .style({
          'z-index': '11',
          'font': '12px sans-serif',
          'text-align': 'left',
          'width': 'auto',
          'height': 'auto',
          'background': '#fff',
          'padding-left': '5px',
          'border': '0px solid red',
          'transform': 'translate(0px, 0px)',
          'pointer-events': 'none'
        });

      //Triangle/pointer thing for tooltip
      var tooltipPointer = tooltip.append('div')
        .style({
          'flex': '0',
          'position': 'absolute',
          'z-index': '15',
          'width': '0px',
          'height': '0px',
          'background': 'none',
          'border-right': '10px solid rgba(0, 0, 0, 0.4)',
          'border-top': '10px solid transparent',
          'border-bottom': '10px solid transparent',
          'pointer-events': 'none',
          //        'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
        });

      //Pointer shadow
      var tooltipPointerUnder = tooltipPointer.append('div')
        .style({
          'flex': '0',
          'position': 'absolute',
          'z-index': '1',
          'width': '0px',
          'height': '0px',
          'background': 'none',
          'border-right': '9px solid white',
          'border-top': '9px solid transparent',
          'border-bottom': '9px solid transparent',
          'pointer-events': 'none',
          'transform': 'translate(1px, -9px)'
            //        'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
        });

      //Updates the tooltip based on x position 
      tooltip.update = function (position) {
        var selectedXVal = xScale.invert(position[0])
        var closestPoint = findClosestXVal(selectedXVal)

        var points = findAllIndexAtX(data[closestPoint[1]][closestPoint[2]][0]);

        var tooltipColorBoxes = [];

        var selectedXData = [];

        for (var a = 0; a < points.length; a++) {
          selectedXData[a] = data[points[a][0]][points[a][1]][1];
        }

        if (xScaleType == 'time') {
          selectedXVal = selectedXVal.toString();
          selectedXVal = selectedXVal.slice(0, 16);
        } else {
          selectedXVal = Math.round(selectedXVal);
        }

        //Create and change text -------------------
        var tooltipValues = '';
        var dataGroupTotal = 0;
        for (var i = 0; i < selectedXData.length; i++) {
          tooltipValues = tooltipValues + labels[points[i][0]] + ': ' + selectedXData[i] + '<br/>';
        }
        tooltipValues = selectedXVal + '<br/>' + tooltipValues;

        tooltipTextArea.html(tooltipValues);


        //Create and change color boxes ------------
        tooltipColorArea
          .attr('height', (selectedXData.length * 14));

        for (var i = 0; i < selectedXData.length; i++) {
          tooltipColorBoxes[i] = tooltipColorArea.append('rect')
            .attr('height', 10)
            .attr('width', 10)
            .attr('x', 0 + 'px')
            .attr('y', (i * 14) + 'px')
            .attr('fill', colors[points[i][0]]);
        }

        var tooltipXPos = Number(tooltip.style('width').slice(0, -2));
        var tooltipYPos = Number(tooltip.style('height').slice(0, -2)) / 2;

        tooltipPointer
          .style('left', (-10) + 'px')
          .style('top', (tooltipYPos - 4) + 'px')

        tooltip
          .style('left', (position[0] + 30) + 'px')
          .style('top', (position[1] - tooltipYPos) + 'px')
          .style('opacity', .9)
          .style('z-index', '5');
      }

      tooltip.hide = function () {
        tooltip.style('opacity', 0);
      }

      return tooltip;
    }


    //Legend ----------------------------------------------------------------------------
    this.generateLegend = function (legendOptions) {

      var legendOptions = legendOptions || {};

      //Element ID if legend will be draw outside of the chartarea
      //If null will place legend inside of the chart area
      var elementID = legendOptions.elementID || null;

      //Set the style of the legend
      //Options ('none', 'default', more to come)
      var style = legendOptions.style || 'default';

      //Position of the legend if inside the chartarea
      //x and y assuming top left corner is 0, 0
      var x = legendOptions.x || null;
      var y = legendOptions.y || null;

      //Set the font of the legend text
      var legendFont = legendOptions.font || 'arial, sans-serif';

      //
      //    //Remove legend if one already exists
      //    if (legend != undefined) {
      //      legend.remove();
      //      legendTextArea.remove();
      //      for (var i = 0; i < maxNumOfGroupedElem; i++) {
      //        legendColorBoxes[i].remove();
      //        legendText[i].remove();
      //      }
      //    }


      var legend;
      var xVal;
      var yVal;
      var legendsvg;
      //Append to element if id is passed in or chartarea if not
      if (elementID == null) {
        legend = plotArea.append('g');
        xVal = (x != null) ? x + padding : plotWidth * 0.75;
        yVal = (y != null) ? y + padding : plotHeight * 0.15;
      } else {
        legendsvg = d3.select(document.getElementById(elementID)).append('svg');
        legend = legendsvg.append('g');
        xVal = 0;
        yVal = 0;
      }

      //Area for text within legend
      var legendTextArea = legend.append('rect')
        .attr('x', xVal)
        .attr('y', yVal)
        .attr('ry', 10)
        .attr('rx', 10)
        .attr('height', 150)
        .attr('width', 150)
        .attr('fill', 'white')
        .attr('stroke', '#c4c4c4')
        .attr('stroke-width', '1px')
        .style('opacity', 0.7)

      var maxBBoxWidth = 0;
      var legendText = [];
      var legendColorBoxes = [];

      //Append box and text for each group
      for (var a = 0; a < data.length; a++) {
        legendColorBoxes[a] = legend.append('rect')
          .attr('x', xVal + 10)
          .attr('y', 10 + yVal + (a * 20))
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colors[a])
          .style('z-index', '99');

        legendText[a] = legend.append('text')
          .attr('x', xVal + 23)
          .attr('y', 19 + yVal + (a * 20))
          .text(labels[a])
          .attr('fill', '#000000')
          .style({
            'font-size': '12px',
            'z-index': '999999999',
            'font-family': legendFont
          });

        //Check if current label name is the longest 
        var bbox = legendText[a].node().getBBox();
        if (bbox.width > maxBBoxWidth) {
          maxBBoxWidth = bbox.width;
        }
      }
      //Adjust text area to fit largest label
      legendTextArea
        .attr('height', 29 + ((data.length - 1) * 20))
        .attr('width', 48 + maxBBoxWidth);

      //Set svg size to legend size
      if (legendsvg != undefined) {
        legendsvg
          .attr('width', legendTextArea.attr('width'))
          .attr('height', legendTextArea.attr('height'));
      }
      return legend;
    }

  }


  /* Bar Chart ----------------------------------------------------------------------- *
     
   
   * --------------------------------------------------------------------------------- */
  this.createBarChart = function (barOptions) {
    //User Options ----------------------------------------------------------------------
    var barOptions = barOptions || {};

    /*Data structure
  
     Group  Bar in group          
       ↓      ↙                   
    [  [Bar1Value, Bar2Value], [Group2] ]   */
    var data = barOptions.data || [[0, 0]];

    /*Optional X value
    Will place the bar groups at the corrisponding x values if an array is passed in

    */
    var groupXValues = barOptions.groupXValues || [];

    /*Chart Type    
    'stacked' - Stacks bars in each group on top one another
    'inline'  - All bars side by side, spaced based on group spacing 
    inline is not working right now                                   */
    var chartType = barOptions.type || 'stacked';

    //Label for each grouping of bars
    var groupLabels = barOptions.groupLabels || ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'];

    //Labels for bars within groups
    var labels = barOptions.labels || ['Bar 1', 'Bar 2', 'Bar 3', 'Bar 4', 'Bar 5']

    //Colors for bars within groups
    var colors = barOptions.colors || ['#e35959', '#5193ed', '#409f2e', '#b241d4', '#e88e40'];

    /*Width of the bars
    Can be assigned a value in pixels or
    'auto' - will find a appropriate width' */
    var barWidth = barOptions.barWidth || 'auto';

    //Whether group tooltips are enabled or not 
    var tooltipEnabled = barOptions.tooltipEnabled || true;

    //Set the layer which determines which order to draw each chart in 
    //ie which charts are on top of which 
    var layer = barOptions.layer || 0;

    //Parse Data ------------------------------------------------------------------------

    groupXValues = parseGroupXValues(groupXValues);


    //Variables -------------------------------------------------------------------------

    //Stores svg groups to which bars are appended
    var barGroup = [];

    //Stores bars
    /*Data structure
     Group  Bar in group          
       ↓   ↙                   
    [  [Bar1, Bar2], [Group2] ]   */
    var bars = [[]];

    //Stores the last bars group x position
    var lastBarWidth = padding;

    var barXVal;

    var barTooltips = [];

    var barGroupArea = [];

    var groupTooltip;

    var domainUpdateIndex = addDomainToChartDomains(updateBarDomain, data);

    var barGroupLeftPadding;
    var barGroupRightPadding;

    //Draw bar chart --------------------------------------------------------------------

    if (tooltipEnabled)
      var groupTooltip = createGroupTooltip();

    //Update chartarea domain
    domain = updateDomain();
    updateScales();
    redrawAxes();

    addChartUpdateToRedrawCharts([updateBarsStacked, layer]);

    redrawCharts(data);

    createGroupTooltip();


    //Public Methods --------------------------------------------------------------------

    //Function that can be called to update the bar charts data
    this.updateBarsStacked = function (updateOptions) {
      var newData;
      if (Array.isArray(updateOptions)) {
        newData = updateOptions;
      } else {
        var updateOptions = updateOptions || {};
        groupXValues = updateOptions.groupXValues || groupXValues;
        groupXValues = parseGroupXValues(groupXValues);
        groupLabels = updateOptions.groupLabels || groupLabels;
        labels = updateOptions.labels || labels;
        colors = updateOptions.colors || colors;
        newData = updateOptions.data || data;
      }

      domain = updateDomain(updateBarDomain(newData), domainUpdateIndex);

      updateScales();
      redrawAxes();

      redrawCharts(data)

      updateBarsStacked(newData);
      redrawCharts(data);
    };


    //Functions -------------------------------------------------------------------------

    //Convert x values into date objects if dates
    function parseGroupXValues(groupVals) {
      if (isNaN(groupVals)) {
        var retVal = [];
        for (var a = 0; a < groupVals.length; a++) {
          var date = new Date(groupVals[a]);
          //Set the date as UTC
          date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
          retVal[a] = date;
        }
        return retVal;
      }
      return groupVals;
    }

    //Returns a domain based on bar data passed in
    function updateBarDomain(data) {
      //Find largest value across all groups
      var largest;
      for (var i = 0; i < data.length; i++) {
        var temp = data[i].reduce(function (a, b) {
          return a + b
        }, 0);
        if (temp > largest || largest == null || largest == undefined) {
          largest = temp;
        };
      }
      var retValue = [domain[0], domain[1], 0, largest];

      if (groupXValues.length != 0) {
        var xVals = d3.extent(groupXValues);

        var scale = updateScaleType(xScaleType)
          .domain([xVals[0], xVals[1]])
          .range([padding, plotWidth]);
        var bWidth = scale.invert(getBarWidth(barWidth, data) + padding)

        if (xScaleType == 'time') {
          var minDate = new Date(xVals[0].getTime() - Math.abs(xVals[0] - bWidth));
          var maxDate = new Date(xVals[1].getTime() + Math.abs(xVals[0] - bWidth));
          retValue = [minDate, maxDate, 0, largest];
        } else {
          retValue = [xVals[0] - bWidth, xVals[1] + bWidth, 0, largest];
        }
      }
      return retValue;
    }


    //Set the bar width if the bar width option is set to auto
    function getBarWidth(bWidth, newData) {
      if (bWidth == 'auto') {
        var temp = plotWidth / newData.length * 0.55;
        if (temp > 60) {
          return 60;
        } else {
          return temp;
        }
      } else {
        return bWidth;
      }
    }



    //Take in new data then add or remove bars to match new data then update and animate the new bars into posititon
    function updateBarsStacked(newData) {

      var newData = newData;

      var bWidth = getBarWidth(barWidth, newData);

      var oldBWidth = getBarWidth(barWidth, data);

      //If there is data which does not yet have a bar group create one and the bars
      if (bars.length < newData.length) {

        var barGroupXVal = lastBarWidth || padding;

        //Cycle through all bars and create them
        for (var a = bars.length; a < newData.length; a++) {

          barGroupLeftPadding = barGroupLeftPadding || 0;
          barGroupRightPadding = barGroupLeftPadding || 0;

          var tempY = plotHeight;

          var barGroupWidth = barGroupLeftPadding + oldBWidth + barGroupRightPadding;

          barGroup[a] = plotArea.append('g');

          //          barGroupArea[a] = barGroup[a].append('rect')
          //            .attr('y', padding)
          //            .attr('x', barGroupXVal)
          //            .attr('height', plotHeight - padding)
          //            .attr('width', barGroupWidth)
          //            //                  .attr('stroke', '#ff0000')
          //            .attr('stroke-width', 2);

          barXVal = barGroupLeftPadding + barGroupXVal;
          barGroupXVal = barGroupXVal + barGroupWidth;

          //          fullArea.append('text')
          //            .attr('x', barXVal + (barWidth / 2))
          //            .attr('y', plotHeight + 15)
          //            .text(groupLabels[a])
          //            .attr('class', 'label')
          //            .attr('text-anchor', 'middle');

          //Store all bars in current group
          var barsTemp = [];

          //Create all stacked bars
          var dataGroupTotal = 0;
          for (var b = 0; b < newData[a].length; b++) {

            var barHeight = plotHeight - yScale(newData[a][b])
            tempY = tempY - barHeight;

            barsTemp[b] = barGroup[a].append('rect')
              .attr('y', tempY)
              .attr('x', plotWidth + barXVal)
              .attr('height', barHeight)
              .attr('width', oldBWidth)
              .attr('fill', colors[b]);
          }

          //Create tooltip area
          if (groupTooltip != undefined) {
            barTooltips[a] = groupTooltip.createTooltipArea(newData[a])
              .attr('y', tempY)
              .attr('x', barXVal + barGroupLeftPadding)
              .attr('height', barHeight)
              .attr('width', oldBWidth);
          }

          bars.push(barsTemp);
          lastBarWidth = lastBarWidth + barGroupWidth;

        }
      }


      //If there is a bar which no longerhas corrisponding data, remove it
      if (bars.length > newData.length) {
        var numBars = bars.length;

        for (var a = newData.length; a < numBars; a++) {

          //Remove all bars in group
          for (var b = 0; b < data[a].length; b++) {

            bars[a][b].transition().duration(200)
              .attr('y', plotHeight)
              .attr('height', 0)
              .attr('width', bWidth)
              .attr('fill', colors[b]);

            bars[a][b].transition().delay(200).remove();
          }
          //Remove tooltips
          barTooltips[a].transition().duration(200)
            .attr('y', plotHeight)
            .attr('height', 0)
            .attr('width', bWidth);

          barTooltips[a].transition().delay(200).remove();
        }
        bars.splice(newData.length, (bars.length - newData.length));
      }


      //If a there is data which does not yet have a stacked bar add it to the group
      for (var a = 0; a < newData.length; a++) {

        if (newData[a].length > bars[a].length) {

          var tempY = plotHeight;
          for (var b = 0; b < bars[a].length; b++) {
            var barHeight = plotHeight - yScale(data[a][b])
            tempY = tempY - barHeight;
          }

          for (var b = bars[a].length; b < newData[a].length; b++) {
            bars[a].push(barGroup[a].append('rect')
              .attr('y', tempY)
              .attr('x', bars[a][0].attr('x'))
              .attr('height', 0)
              .attr('width', bWidth)
              .attr('fill', colors[b]));
          }
        }
      }

      //Set new data as current data
      data = newData;

      //Set group padding
      barGroupLeftPadding = (plotWidth - padding - (bWidth * data.length)) / (data.length * 2);
      barGroupRightPadding = (plotWidth - padding - (bWidth * data.length)) / (data.length * 2);

      var barGroupXVal = padding;

      //Update positioning and other attributes of bars
      for (var a = 0; a < data.length; a++) {
        var tempY = plotHeight;

        var barGroupWidth;

        if (groupXValues.length == 0) {
          barGroupWidth = barGroupLeftPadding + bWidth + barGroupRightPadding;
          barXVal = barGroupLeftPadding + barGroupXVal;
          barGroupXVal = barGroupXVal + barGroupWidth;
        } else {
          barXVal = xScale(groupXValues[a]) - (bWidth / 2);
        }

        var removeIndex = null;

        for (var b = 0; b < bars[a].length; b++) {

          if (!isNaN(tempY)) {
            var lastY = tempY;
          }
          var barHeight = plotHeight - yScale(newData[a][b])
          tempY = tempY - barHeight;


          if (data[a][b] != undefined) {

            bars[a][b].transition().duration(400)
              .attr('y', tempY)
              .attr('x', barXVal)
              .attr('height', barHeight)
              .attr('width', bWidth);

            lastBarWidth = barXVal;

            //Remove stacked bars if no data
          } else {
            bars[a][b].transition().duration(400)
              .attr('y', lastY)
              .attr('x', barXVal)
              .attr('height', 0)
              .attr('width', bWidth);

            bars[a][b].transition().delay(400).remove();

            if (removeIndex == null || removeIndex > b) {
              removeIndex = b;
            }
          }
        }

        //Update tooltip
        if (barTooltips[a] != undefined) {
          barTooltips[a].datum(data[a]);

          barTooltips[a].transition().duration(400)
            .attr('y', tempY)
            .attr('x', barXVal)
            .attr('height', plotHeight - tempY)
            .attr('width', bWidth)
        }

        //Remove stacked bar from bars array
        if (removeIndex != null) {
          bars[a].splice(removeIndex, bars[a].length);
        }
      }
    }


    //Tooltips --------------------------------------------------------------------------

    function createGroupTooltip() {
      var tooltip = d3.select('body').append('div')
        .style({
          'display': 'flex',
          'flex-direction': 'row',
          'position': 'absolute',
          'z-index': '10',
          'opacity': 0,
          'font': '12px sans-serif',
          'text-align': 'left',
          'padding': '4px',
          'padding-left': '6px',
          'padding-right': '0px',
          'border-radius': '5px',
          'width': 'auto',
          'height': 'auto',
          'background': '#fff',
          'pointer-events': 'none',
          'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          'border': '1px solid rgba(0, 0, 0, 0.24)'
        });

      //Area within tooltip for color boxes
      var tooltipColorArea = tooltip.append('div')
        .style({
          'z-index': '11',
          'text-align': 'left',
          'width': 'auto', //10
          'height': 'auto', //40
          'background': '#fff',
          'border': '0px solid green',
          'pointer-events': 'none'
        })
        .append('svg')
        .style('margin-top', '1px')
        .attr('width', '10px')
        .style('border', '0px solid purple');

      //Area within tooltip for text
      var tooltipTextArea = tooltip.append('div')
        .style({
          'z-index': '11',
          'font': '12px sans-serif',
          'text-align': 'left',
          'width': 'auto',
          'height': 'auto',
          'background': '#fff',
          'padding-left': '5px',
          'border': '0px solid red',
          'transform': 'translate(0px, 0px)',
          'pointer-events': 'none'
        });

      //Triangle/pointer thing for tooltip
      var tooltipPointer = tooltip.append('div')
        .style({
          'flex': '0',
          'z-index': '15',
          'width': '0px',
          'height': '0px',
          'background': 'none',
          'border-left': '11px solid transparent',
          'border-right': '11px solid transparent',
          'border-top': '11px solid rgba(0, 0, 0, 0.25)',
          'pointer-events': 'none'
        });

      //Pointer shadow
      var tooltipPointerUnder = tooltipPointer.append('div')
        .style({
          'flex': '0',
          'position': 'absolute',
          'z-index': '1',
          'width': '0px',
          'height': '0px',
          'background': 'none',
          'border-right': '9px solid transparent',
          'border-left': '9px solid transparent',
          'border-top': '9px solid #fff',
          'pointer-events': 'none',
          'transform': 'translate(-9px, -12px)'
        });

      //Create and return a bar group tooltip area rect for passed in data
      tooltip.createTooltipArea = function (tooltipData) {
        var tooltipColorBoxes = [];
        var inlineBarsOuter = [];
        var inlineBarsInner = [];

        var tooltipArea = plotArea.append('rect')
          .datum(tooltipData)
          .attr('fill', '#818181')
          .attr('class', 'mouseOverArea')
          .style('opacity', 0)
          .on('mouseover', function (d) {
            //Make mouseover area visible
            var rect = d3.select(event.target);
            rect.style('opacity', 0.3);

            //Create and change text 
            var tooltipValues = '';
            var dataGroupTotal = 0;
            for (var i = d.length - 1; i > -1; i--) {
              dataGroupTotal = dataGroupTotal + d[i];
              tooltipValues = tooltipValues + labels[i] + ': ' + d[i] + '<br/>';
            }
            tooltipValues = '' + tooltipValues + 'Total: ' + dataGroupTotal;

            tooltipTextArea.html(tooltipValues);

            //Create and change color boxes 
            tooltipColorArea
              .attr('height', (d.length * 14));

            var colorCounter = d.length - 1;
            for (var i = 0; i < d.length; i++) {
              tooltipColorBoxes[i] = tooltipColorArea.append('rect')
                .attr('height', 10)
                .attr('width', 10)
                .attr('x', 0 + 'px')
                .attr('y', (i * 14) + 'px')
                .attr('fill', colors[colorCounter]);
              colorCounter--;
            }

            //Make tooltip visiable and set pos 
            var tooltipXPos = Number(tooltip.style('width').slice(0, -2)) / 2;
            var tooltipYPos = Number(tooltip.style('height').slice(0, -2));
            tooltipPointer.style('transform', 'translate(' + (-tooltipXPos + 5) + 'px,' + (tooltipYPos + 4) + 'px)');

            tooltip
              .style('left', (d3.event.pageX - tooltipXPos) + 'px')
              .style('top', (d3.event.pageY - tooltipYPos - 20) + 'px')
              .style('opacity', .9)
              .style('z-index', '5');


            //Show inline bars

            //              for (var i = 1; i < d.length; i++) {
            //
            //                inlineBarsOuter[i] = plotArea.append('rect')
            //                  .attr('y', yScale(d[i]))
            //                  .attr('x', (Number(rect.attr('x'))))
            //                  .attr('height', plotHeight - yScale(d[i]))
            //
            //                .attr('width', bWidth)
            //                  .attr('stroke', colors[i])
            //                  .attr('stroke-width', 3)
            //                  .attr('fill', 'none')
            //                  .style('pointer-events', 'none');
            //
            //                inlineBarsOuter[i]
            //                  .transition().duration(400)
            //                  .attr('x', (Number(rect.attr('x')) + (i * 10)));
            //
            //                inlineBarsInner[i] = plotArea.append('rect')
            //                  .attr('y', yScale(d[i]))
            //                  .attr('x', (Number(rect.attr('x'))))
            //                  .attr('height', plotHeight - yScale(d[i]))
            //                  .attr('width', bWidth)
            //                  .attr('fill', colors[i])
            //                  .style('opacity', 0.3)
            //                  .style('pointer-events', 'none');
            //
            //
            //                inlineBarsInner[i]
            //                  .transition().duration(400)
            //                  .attr('x', (Number(rect.attr('x')) + (i * 10)));
            //
            //              }

          })
          //Move tooltip with mouse
          .on('mousemove', function (d) {

            //Set the pos
            var tooltipXPos = Number(tooltip.style('width').slice(0, -2)) / 2;
            var tooltipYPos = Number(tooltip.style('height').slice(0, -2));
            tooltipPointer.style('transform', 'translate(' + (-tooltipXPos + 5) + 'px,' + (tooltipYPos + 4) + 'px)');

            tooltip
              .style('left', (d3.event.pageX - tooltipXPos) + 'px')
              .style('top', (d3.event.pageY - tooltipYPos - 20) + 'px');
          })
          //Make tooltip and mouseover area invisble on mouseout
          .on('mouseout', function (d) {
            var rect = d3.select(event.target);
            rect.style('opacity', 0);
            tooltip.transition().duration(0)
              .style('opacity', 0);

            //Remove inline bars 
            //              for (var i = 1; i < inlineBarsOuter.length; i++) {
            //                inlineBarsOuter[i].remove();
            //                inlineBarsInner[i].remove();
            //              }
          });
        return tooltipArea;
      }
      return tooltip;
    }


    //Legend ----------------------------------------------------------------------------

    this.generateLegend = function (legendOptions) {

      var legendOptions = legendOptions || {};

      //Element ID if legend will be draw outside of the chartarea
      //If null will place legend inside of the chart area
      var elementID = legendOptions.elementID || null;

      //Set the style of the legend
      //Options ('none', 'default', more to come)
      var style = legendOptions.style || 'default';

      //Position of the legend if inside the chartarea
      //x and y assuming top left corner is 0, 0
      var x = legendOptions.x || null;
      var y = legendOptions.y || null;

      //Set the font of the legend text
      var legendFont = legendOptions.font || 'arial, sans-serif';

      var legend;
      var xVal;
      var yVal;
      var legendsvg;
      //If element is passed in append legend to element if not append to chart area
      if (elementID == null) {
        legend = plotArea.append('g');
        xVal = (x != null) ? x + padding : plotWidth * 0.75;
        yVal = (y != null) ? y + padding : plotHeight * 0.15;
      } else {
        legendsvg = d3.select(document.getElementById(elementID)).append('svg');
        legend = legendsvg.append('g');
        xVal = 0;
        yVal = 0;
      }

      //Find the group that has the largest number of bars
      var maxNumOfGroupedElem = 0;
      for (var a = 0; a < data.length; a++) {
        maxNumOfGroupedElem = data[a].length > maxNumOfGroupedElem ? data[a].length : maxNumOfGroupedElem;
      }

      //      if (legend != undefined) {
      //        legend.remove();
      //        legendTextArea.remove();
      //        for (var i = 0; i < maxNumOfGroupedElem; i++) {
      //          legendColorBoxes[i].remove();
      //          legendText[i].remove();
      //        }
      //      }

      //Area within legend for text
      var legendTextArea = legend.append('rect')
        .attr('x', xVal)
        .attr('y', yVal)
        .attr('ry', 10)
        .attr('rx', 10)
        .attr('height', 150)
        .attr('width', 150)
        .attr('fill', '#fff')
        .attr('stroke', '#c4c4c4')
        .attr('stroke-width', '1px')
        .style('opacity', 0.7)


      var maxBBoxWidth = 0;
      var legendText = [];
      var legendColorBoxes = [];

      //Append a color box and text for each bar in the groups
      for (var a = 0; a < maxNumOfGroupedElem; a++) {
        legendColorBoxes[a] = legend.append('rect')
          .attr('x', xVal + 10)
          .attr('y', 10 + yVal + ((maxNumOfGroupedElem - 1 - a) * 20))
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colors[a])
          .style('z-index', '99');

        legendText[a] = legend.append('text')
          .attr('x', xVal + 23)
          .attr('y', 19 + yVal + ((maxNumOfGroupedElem - 1 - a) * 20))
          .text(labels[a])
          .attr('fill', '#000000')
          .style({
            'font-size': '12px',
            'z-index': '999999999',
            'font-family': legendFont
          });

        //Adjust text area to fit all text
        var bbox = legendText[a].node().getBBox();
        if (bbox.width > maxBBoxWidth) {
          maxBBoxWidth = bbox.width;
        }
      }
      legendTextArea
        .attr('height', 29 + ((maxNumOfGroupedElem - 1) * 20))
        .attr('width', 48 + maxBBoxWidth);
    }


  }


}