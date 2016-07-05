/* Bar Chart ----------------------------------------------------------------------- *
   Creates a bar chart on the chart area the function was called upon

 * --------------------------------------------------------------------------------- */

'use strict';

module.exports = function (chartArea) {

  chartArea.createBarChart = function (barOptions) {
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
    var tooltipEnabled = barOptions.tooltipEnabled || false;

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
    var bars = [];

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
          if (groupTooltip != undefined) {
            barTooltips[a].transition().duration(200)
              .attr('y', plotHeight)
              .attr('height', 0)
              .attr('width', bWidth);
            barTooltips[a].transition().delay(200).remove();
          }

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