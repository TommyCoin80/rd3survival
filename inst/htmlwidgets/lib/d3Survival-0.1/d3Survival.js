d3.survival = function(message) {
  
  var margin = {top:10,left:75,bottom:50,right:40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    xlim = valPropLen(message.options,'xlim'),
    ylim = valPropLen(message.options,'ylim'),
    lastExtent = [[0,0],[0,0]],
    svg;


  function valPropLen(obj, prop, len) {
    len = len || 2;
    return obj[prop] && obj[prop].length == len ? obj[prop] : null;
  } 

  
  function nestData(data) {
    var nest;
    if(data[0].strata !== undefined) {
      nest = d3.nest()
        .key(function(d) { return d.strata})
        .entries(data);
    } else {
      nest = [{key:'series', values:data}];
    }
    return nest;
  }
  
  var f = function(context) {
    // draw the graph
    context.selectAll('*').remove(); // remove old graphs
    
    var nest = nestData(message.data);

    svg = context.append('svg')
      .attr('width','100%')
      .attr('height','100%')
      .attr('viewBox','0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')')

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // "time"      "n.risk"    "n.event"   "n.censor"  "estimate"  "std.error" "conf.high" "conf.low" 

    var color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(d3.map(nest, function(d) { return d.key}))
      
      
    var domain = {
        x: xlim || d3.extent(message.data, function(d) { return d['time']}),
        y: ylim|| [d3.min(message.data, function(d) { return d['conf.low']}), d3.max(message.data, function(d) { return d["conf.high"]})]
    }

    var x = d3.scaleLinear()
      .domain(domain.x)
      .range([0,width])
      .nice();

    var y = d3.scaleLinear()
      .domain(domain.y)
      .range([height,0])
      .nice();

    var yAxis = d3.axisLeft(y).tickFormat(d3.format('.2%')),
        yGrid = d3.axisLeft(y).tickSizeInner(-width),
        xAxis = d3.axisBottom(x),
        xGrid = d3.axisBottom(x).tickSizeInner(-height);
      
    var brush = d3.brush()
      .extent([[0,0],[width,height]])
      .on("end", brushed)
    
      
    svg.append("defs").append("clipPath")
        .attr("id", "limit-clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    
    var line = d3.line()
      .x(function(d) { return x(d.time)})
      .y(function(d) { return y(d.estimate)});

    var area = d3.area()
      .x(function(d) { return x(d.time)})
      .y0(function(d) { return y(d['conf.low'])})
      .y1(function(d) { return y(d['conf.high'])});
      
      
    svg.append('g')
        .classed('grid y',true)
        .call(yGrid)

    svg.append('g')
        .classed('grid x',true)
        .attr('transform','translate(0,' + height + ')')
        .call(xGrid)

    var strata = svg.append('g')
        .attr('clip-path','url(#limit-clip)')
        .selectAll('.strata')
        .data(nest)
        .enter()
        .append('g')


    var conf = strata.append('path')
      .classed('confidence',true)
      .attr('d', function(d) { return area(d.values)})
      .style('fill', function(d) { return color(d.key)});
      
      
    var estimate = strata.append('path')
      .classed('estimate',true)
      .attr('d', function(d) { return line(d.values)})
      .style('stroke', function(d) { return color(d.key)});
      
      
    svg.append('g')
      .classed('axis x', true)
      .attr('transform','translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
      .classed('axis y', true)
      .call(yAxis)

    svg.append("g")
      .attr("class", "brush")
      .call(brush)
      
      
    function brushed() {
        
        function arrangeSelection(sel) {
            return [
                [d3.min([sel[0][0],sel[1][0]]),d3.max([sel[0][1],sel[1][1]])],
                [d3.max([sel[0][0],sel[1][0]]),d3.min([sel[0][1],sel[1][1]])]
            ]
        }
        
        function flatten(x) {
                  return [x[0][0],x[0][1],x[1][0],x[1][1]];
        }
        
        function zoomChart(xDomain, yDomain) {
            x.domain(xDomain).nice()
            y.domain(yDomain).nice() 
            conf.attr('d', function(d) { return area(d.values)})
            estimate.attr('d', function(d) { return line(d.values)})
            svg.select('.axis.y').call(yAxis)
            svg.select('.grid.y').call(yGrid)
            svg.select('.axis.x').call(xAxis)
            svg.select('.grid.x').call(xGrid)
        }

        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

        var s = arrangeSelection(d3.event.selection || [[0,0],[0,0]]);

        if(d3.sum(flatten(s)) > 0) {
            lastExtent = s;
            zoomChart([x.invert(s[0][0]),x.invert(s[1][0])], [y.invert(s[0][1]),y.invert(s[1][1])])
            svg.select('g.brush').call(brush.move, [[0,0],[0,0]])
        } else if(d3.sum(flatten(lastExtent))==0) {
                zoomChart(domain.x, domain.y)
        } else {
            lastExtent = [[0,0],[0,0]];
        }
    }
    

  }
  
  return f;
  
}