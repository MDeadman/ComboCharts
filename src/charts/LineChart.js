/* Line Chart ---------------------------------------------------------------------- *
   Creates a line chart on the chart area the function was called upon

 * --------------------------------------------------------------------------------- */

module.exports = function() {
  
  var createLineChart = function (lineOptions) {
    //User Options ----------------------------------------------------------------------
    var lineOptions = lineOptions || {};

    /*Data structure
                           Further data points can be passed 
                           in to graph in companion graphs or
    Line   Data Point      graph totals/comparisons/etc
      ↓   ↙                          ↓↓
    [ [  [xValue, yValue(, optional extra y values)], [dataPoint2] ], [line2], [etc...] ]  */
    var data = lineOptions.data || []

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

      //Updates the tooltip based on mouse position
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
        
        var divPos = chartElement.getBoundingClientRect();
        
        tooltip
          .style('left', (divPos.left + position[0] + 30) + 'px')
          .style('top', (divPos.top + position[1] - tooltipYPos - 8) + 'px')
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
  return createLineChart;
}