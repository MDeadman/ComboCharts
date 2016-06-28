# Chart Area
To first make a chart you have to create a chart area. 
The chart area defines the axes and provides a space for the charts and other elements to be appended to.
Charts require a chart area to be created, 
whereas other elements must be created on an existing chart or chart area but can be appended to another element.

To create a chart area

```
new ComboChart.ChartArea(ElementIdString, OptionsObject)
```
### Options
The following are options that can be passed into the options object to customise the chart area.

Property | Type | Usage
--- | --- | ---
padding | `Number` | The padding around the plot area. For example if set to zero will hide axes, or can be set to a larger number to show longer values
width | `Number` | The width of the entire chart area
height | `Number` | The height of the entire chart area
font | `String` | Sets the font family of the axes
xGridEnabled | `Boolean` | Draw x axis grid lines
yGridEnabled | `Boolean` | Draw y axis grid lines
xScaleType | `String` | Set the x axis scale type. <br> Options are `'linear', 'time', 'sqrt', 'pow', 'log'`
yScaleType | `String` | Set the y axis scale type. <br> Options are `'linear', 'time', 'sqrt', 'pow', 'log'`

### Creating Charts   
The following functions can be called on a chart area to create charts on the respective chart area. The new keyword is required for assigning created charts to variables.
This can be done such as the following example

```javascript
var chartarea = new ComboChart.ChartArea('scaleChart', {
      width: 1200,
      height: 700
    })

var linechart = new chartarea.createLineChart({
      data: [[[1, 10], [2, 20], [3, 30], [4, 40]]]
    })
```
Function | Parameters | Returns | Usage
--- | --- | --- | ---
createLineChart | (`Object`)<br>(OptionsObject) | Line Chart Object | Creates a Line charts with the specified options. [View line chart documentation](https://github.com/MDeadman/ComboCharts/blob/dev/docs/02-LineChart.md)
createBarChart | (`Object`)<br>(OptionsObject) | Bar Chart Object | Creates a bar charts with the specified options. [View bar chart documentation](https://github.com/MDeadman/ComboCharts/blob/dev/docs/03-BarChart.md)

### Getting Data
The following functions can be called on a chart area to get values about the chart area or charts within the chart area.

Function | Parameters | Returns | Usage
--- | --- | --- | ---
getDomain | none | `array`<br>[x axis min, x axis max, y axis min, y axis max] | Returns the current domain of the chart area in the form of an array
getSelectedData | none | `array`<br>Array of selected data | Returns an array of the currently selected data points. As of right now each point is an array containing x and y values ([xvalue, yvalue]). In future versions selected data will be returned as objects with further info on each point.






