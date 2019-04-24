d3.survival = function(data) {
  
  var margin = {top:10,left:50,bottom:50,right:40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    svg;
    
  var f = function(context) {
    // draw the graph
    context.selectAll('*').remove(); // remove old graphs
    
    svg = context.append('svg')
      .attr('width','100%')
      .attr('height','100%')
      .attr('viewBox','0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')')

    // "time"      "n.risk"    "n.event"   "n.censor"  "estimate"  "std.error" "conf.high" "conf.low" 

    var x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d['time']}))
      .range([0,width])
      .nice();

    var y = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d['conf.low']}), d3.max(data, function(d) { return d["conf.high"]})])
      .range([height,0])
      .nice();

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y)
      .tickFormat(d3.format('.2p'))
    
    svg.append('g')
      .classed('axis', true)
      .attr('transform','translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
      .classed('axis', true)
      .call(yAxis)
    
    var line = d3.line()
      .x(function(d) { return x(d.time)})
      .y(function(d) { return y(d.estimate)});

    var area = d3.area()
      .x(function(d) { return x(d.time)})
      .y0(function(d) { return y(d['conf.low'])})
      .y1(function(d) { return y(d['conf.high'])});


    svg.selectAll('.estimate')
      .data([data])
      .enter()
      .append('path')
      .classed('estimate',true)
      .attr('d', line);

    svg.selectAll('.confidence')
      .data([data])
      .enter()
      .append('path')
      .classed('confidence',true)
      .attr('d',area);
    

  }
  
  return f;
  
}