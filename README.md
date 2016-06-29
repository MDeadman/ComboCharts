# ComboCharts

**Note**: This is a very early work in progress, much of the work here will change and some of the functionality described is not yet functional. This project is very much a learning experience for me!

**Note**: ComboCharts does not currently work with D3 4.0, use a 3.X version. Support for 4.0 coming soon™

ComboCharts is a WIP graphing library based on D3.js aimed at bringing interactivity to charts. With the ability to mix charts and tool elements, select data, customize events and update charts with animated transitions, ComboCharts aims to provide all the functionality you would need to create interactive charts.

##### Motivation
This library started when I was having trouble finding an open source graphing library that provided the interactivity I wanted. 
Data is often not so two dimensional that the full picture can be displayed with a simple chart. 
I wanted a way to be able to select data and see further details or show compositions or use the data elsewhere. 
I decided it would not only be a fun project and learning experience but a useful one to create a library that really allows you 
to interact with your data, so I started work on ComboCharts. Much of this is a learning experience for me and an early work in progress.

## Installation

Load the scripts, ComboCharts relies on D3 so remember to load d3 before ComboCharts

```html
<script src="d3.js"></script>
<script src="ComboCharts.js"></script>
```

## Example

To use ComboCharts you must first create a chart area. A chart area is where charts and other elements will be created and displayed. From there we can can create out charts and add our interactivity. 

For example

```javascript
var chartarea = new ComboChart.ChartArea('scaleChart', {
  width: 1200,
  height: 700,
  xScaleType: 'time'
})

var linechart = new chartarea.createLineChart({
  data: lineData,
  xLineSelection: true,
  xCursorLine: true,
  xPosTooltip: true,
  layer: 2
})

linechart.generateLegend({
  x: 900,
  y: 20
})

var barchart = new chartarea.createBarChart({
  data: barData,
  groupXValues: ['2015-02-01', '2015-04-01', '2015-05-01', '2015-11-01'],
  barWidth: 30,
  layer: 1
  })

barchart.generateLegend({
  x: 700,
  y: 20
})
```

![alt text](http://i.imgur.com/Xbj1sZj.jpg "Example Chart")

## API Reference
Check out the [Getting Started Docs](https://github.com/MDeadman/ComboCharts/blob/master/docs/00-GettingStarted.md)
Or the [full documentation](https://github.com/MDeadman/ComboCharts/tree/master/docs)

## Todo List 
Much of this project is an early WIP and learning experience.
If you are interested in seeing the progress, 
you can check out the list of features and functionality being worked on or planned, all coming soon™.

* D3 4.0 support
* Event Listeners
* Animated line chart update  
* Animated chart area axis 
* Fix bar chart selection
* Inline bar options (only stacked bars work right now)
* Single data point tooltips and selection
* X axis navigation tool
* Unit tests
* Pie Charts!

## License
This project uses the MIT license.
