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
data | `Array` | The data used to create the line. Structure as follows <br>`[ [ [xValue, yValue(, optional extra y values)], [dataPoint2] ], [line2], [etc...] ]`
padding | `Number` | The padding around the plot area. For example if set to zero will hide axes, or can be set to a larger number to show longer values
width | `Number` | The width of the entire chart area
height | `Number` | The height of the entire chart area
font | `String` | Sets the font family of the axes
xGridEnabled | `Boolean` | Draw x axis grid lines
yGridEnabled | `Boolean` | Draw y axis grid lines
