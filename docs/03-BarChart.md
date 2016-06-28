# Bar Chart
To create a bar chart the function createBarChart has to be called on a chart area object with an options object passed in.
The bar chart will be draw on the chart area the function is called on.
The new keyword must be used for assigning the bar chart to a variable. 

To create a bar chart 
```javascript
var chartarea = new ComboChart.ChartArea('ComboChartId', {
  width: 1200,
  height: 700
})
    
var barchart = new chartarea.createBarChart({
  data: [[2, 37], [3, 8, 11], [7, 14], [7, 8]]
})
```

### Options
The following are options that can be passed into the options object to customise the bar chart.

Property | Type | Usage
--- | --- | ---
data | `Array` | The data used to create the bars. Structure as follows <br>`[  [Bar1Value, Bar2Value], [Group2] ] `
colors | `Array` of<br>`String` | Sets the colors for the bars of each group. Each color applies to the bar of matching index within each group. Colors can be strings of hex colors or rgb colors
groupXValues | `Array` | If values are passed in, will draw the bar groups at the x values passed in. The x values apply to the bar groups of matching index 
labels | `Array` of<br>`String` | Sets the labels for the bars of each group. Each label applies to the bar of matching index within each group.
groupLabels | `Array` of<br>`String` | Sets the labels for each grouping of bars. Each group label applies to the bar group of matching index.
layer | `Number` | Sets the layer value for this line chart. The layer value determines the layering of the charts within a chart area. Charts will be drawn on top of charts that have lower layer values and below charts with higher layer values.
barWidth | `Number` | If assigned a value will set the bar width to a spcific pixel value. If unassigned a bar width will be automatically found. 
tooltipEnabled | `Boolean` | If enabled will create a tooltip upon mousing over a bar grouping showing the values of all the bars within said group.

### Updating data 
The data and other options within the bar chart can be updated by calling the updateBarsStacked function on the bar chart object.
The updateBarsStacked function will take in either an array containing the new data or an options object.
The options that can be updated (for right now) are `data, groupXValues, labels, groupLabels, colors`
These options are functionally the same as above.

An example of updating data and the bars x posititon

```javascript
barchart.updateBarsStacked({
  data: [[24, 31], [3, 8], [3, 11], [12, 23]],
  groupXValues: ['2015-02-01', '2015-04-01', '2015-05-01', '2015-11-01'],
})
```

### Getting Data
The following functions can be called on a line chart to get values about the line chart.

Function | Parameters | Returns | Usage
--- | --- | --- | ---

### Event Listeners 
