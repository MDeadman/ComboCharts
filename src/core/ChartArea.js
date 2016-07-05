/* Chart Area ---------------------------------------------------------------------- *
   Creates the chart area where charts and other element can be created

 * --------------------------------------------------------------------------------- */

'use strict';

module.exports = function () {

  var chartArea = function (elementId, options) {

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

  }
  return chartArea;
}