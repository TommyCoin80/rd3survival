d3.survival = function(data) {
  
  var margin = {top:10,left:50,bottom:50,right:40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    svg;

  function nestData(data) {
    if(data[0].strata != undefined) {
      var nest = d3.nest()
        .key(function(d) { return d.strata})
        .entries(data);
    } else {
      var nest = [{key:'series', values:data}];
    }
    return(nest)
  }


  var f = function(context) {
    // draw the graph
    context.selectAll('*').remove(); // remove old graphs
    
    var nest = nestData(data);

    svg = context.append('svg')
      .attr('width','100%')
      .attr('height','100%')
      .attr('viewBox','0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')')

    // "time"      "n.risk"    "n.event"   "n.censor"  "estimate"  "std.error" "conf.high" "conf.low" 

    var color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(d3.map(nest, function(d) { return d.key}))

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
      
    svg.append('clipPath')
      .attr('id', 'limit-clip')
      .append('rect')
      .attr('height', height)
      .attr('width', width)
    
    var line = d3.line()
      .x(function(d) { return x(d.time)})
      .y(function(d) { return y(d.estimate)});

    var area = d3.area()
      .x(function(d) { return x(d.time)})
      .y0(function(d) { return y(d['conf.low'])})
      .y1(function(d) { return y(d['conf.high'])});


    svg.selectAll('.estimate')
      .data(nest)
      .enter()
      .append('path')
      .attr('clip-path','url(#limit-clip)')
      .classed('estimate',true)
      .attr('d', function(d) { return line(d.values)})
      .style('stroke', function(d) { return color(d.key)});

    svg.selectAll('.confidence')
      .data(nest)
      .enter()
      .append('path')
      .attr('clip-path','url(#limit-clip)')
      .classed('confidence',true)
      .attr('d', function(d) { return area(d.values)})
      .style('fill', function(d) { return color(d.key)});
    

  }
  
  return f;
  
}