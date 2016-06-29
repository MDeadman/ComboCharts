
# Getting Started

#### Download ComboCharts
* [Standard build](https://raw.githubusercontent.com/MDeadman/ComboCharts/master/dist/ComboCharts.js)
* [Minified bulid](https://raw.githubusercontent.com/MDeadman/ComboCharts/master/dist/ComboCharts.min.js)

### Installation

Load the scripts, ComboCharts relies on D3 so remember to load d3 before ComboCharts

```html
<script src="d3.js"></script>
<script src="ComboCharts.js"></script>
```
Wowsers you are now ready to use ComboCharts!

### Creating a Chart Area

First, create a div with an id to be used as your chart.
```html
<div id="ComboChartArea"></div>
```
First thing we need to do is create a chart area where we can add charts and other elements. 
This is done by initializing the ChartArea class and assigning it to a variable. 
ChartArea takes in the div id as a string and an options object.

```javascript
    var chartarea = new ComboChart.ChartArea('ComboChartArea', {
      width: 600,
      height: 400
    })
```

### Creating a Line Chart

From here we can create charts for our chart area. We are going to start by creating a line graph.
This is done by creating a line chart class by calling createLineChart on our chart area. 
createLineChart takes in an options object.

```javascript
    var chartarea = new ComboChart.ChartArea('ComboChartArea', {
      width: 600,
      height: 400
    })
    
    var linechart = new chartarea.createLineChart({
      data: [[[1, 12], [2, 14], [3, 17], [4, 20], [5, 24]]]
    })
```
In the options object we can see the data is being passed in as a series of nested arrays. 
More options for passing in data will be available in later versions. 
For now the data structure for the line chart is as follows.

```
                           Further data points can be passed 
                           in to graph the total or composition
    Line   Data Point      of the y values
      ↓  ↙                          ↓↓
    [ [ [xValue, yValue(, optional extra y values)], [dataPoint2] ], [line2], [etc...] ]
```
Heres what we have made so far

![alt text](http://i.imgur.com/JXq3sAn.jpg "Basic Line Chart")

Those are the basics of ComboCharts!
