# Line Chart
To create a line chart the function createLineChart has to be called on a chart area object with an options object passed in.
The line chart will be draw on the chart area the function is called on.
The new keyword must be used for assigning the line chart to a variable. 

To create a line chart 
```javascript
    var chartarea = new ComboChart.ChartArea('ComboChartId', {
      width: 1200,
      height: 700
    })
    
    var linechart = new chartarea.createLineChart({
      data: data
    })
```

### Options
The following are options that can be passed into the options object to customise the line chart.

Property | Type | Usage
--- | --- | ---
data | `Array` | The data used to create the line. Structure as follows <br>`[ [ [xValue, yValue(, optional extra y values)], [dataPoint2] ], [line2], [etc...] ]`
colors | `Array` of<br>`String` | Sets the colors for the lines. Each color applies to the line of matching index. Colors can be strings of hex colors or rgb colors
labels | `Array` of<br>`String` | Sets the labels for the lines. Each label applies to the line of matching index.
layer | `Number` | Sets the layer value for this line chart. The layer value determines the layering of the charts within a chart area. Charts will be drawn on top of charts that have lower layer values and below charts with higher layer values.
pointStyle | `String` | Set the style of the data points.<br>Options are `'dot', 'doughnut', 'none'`
interpolation | 'String' | Set the interpolation type of the lines.<br>Options are `'linear', 'step', 'step-before', 'step-after', 'cardinal', 'bundle', 'monotone'`
showArea | `Boolean` | If true, will display areas below the lines
xLineSelection | `Boolean` | If true will enable x line selection. On click this will set the currently selected data to all points at the nearest x value that contains points. 
xCursorLine | `Boolean` | If true will draw a vertical line at the cursors position while mousing over the plot area.
xPosTooltip | `Boolean` | If true will draw a tooltip at the cursors position showing all the points data at the nearest x value which has points. 

### Updating data 



### Getting Data
The following functions can be called on a line chart to get values about the line chart.

Function | Parameters | Returns | Usage
--- | --- | --- | ---

