function drawChart(){
    var tmpData = jsonData["values"];
    var parseDate = d3.timeParse("%Y-%m-%d")
    
    //data set
    var prices = tmpData.map(d=>{
        return {
            date : parseDate(d["date"]),
            high: d["high"],
            low: d["low"],
            open: d["open"],
            close: d["close"]
        }
    }); 
    var formatDate = d3.utcFormat("%Y.%m.%d")
    
    //tooltip set
    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    //margin, width, height set
    const margin = {top: 15, right: 65, bottom: 20, left: 50},
		w = 2000 - margin.left - margin.right,
		h = 700 - margin.top - margin.bottom;

    //svg size, translate set
    var svg = d3.select("#container")
                    .attr("width", w + margin.left + margin.right)
                    .attr("height", h + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" +margin.left+ "," +margin.top+ ")");

    var dates = prices.map(d=>d["date"]);
    var xmin = d3.min(prices.map(r => r.date.getTime()));
    var xmax = d3.max(prices.map(r => r.date.getTime()));
    var xScale = d3.scaleLinear().domain([-1, dates.length])
                    .range([0, w])
    var xDateScale = d3.scaleQuantize().domain([0, dates.length]).range(dates)
    var xBand = d3.scaleBand().domain(d3.range(-1, dates.length)).range([0, w]).padding(0.3)
    var xAxis = d3.axisBottom()
                            .scale(xScale)
                            .tickFormat(function(d) {
                                    d = dates[d];
                                    return formatDate(d);
                                });
    
    var rect_svg = svg.append("rect")
                .attr("id","rect")
                .attr("width", w)
                .attr("height", h)
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr("clip-path", "url(#clip)")
    
    var gX = svg.append("g")
                .attr("class", "axis x-axis") //Assign "axis" class
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis)
    

    var ymin = d3.min(prices.map(r => r.low));
    var ymax = d3.max(prices.map(r => r.high));
    
    var yScale = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]).nice();
    var yAxis = d3.axisLeft()
                    .scale(yScale)
    
    var gY = svg.append("g")
                .attr("class", "axis y-axis")
                .call(yAxis);
    
    //add the X gridlines
    var xGrid = svg.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(0," + h + ")")
        .call(make_x_gridlines()
            .tickSize(-h)
            .tickFormat("")
    )

    //add the Y gridlines
    var yGrid = svg.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-w)
            .tickFormat("")
        )

    var chartBody = svg.append("g")
                .attr("class", "chartBody")
                .attr("clip-path", "url(#clip)");


    
    // draw high and low
    let stems = chartBody.selectAll("g.line")
        .data(prices)
        .enter()
        .append("line")
        .attr("class", "stem")
        .attr("x1", (d, i) => xScale(i) - xBand.bandwidth()/2+ xBand.bandwidth()*0.5)
        .attr("x2", (d, i) => xScale(i) - xBand.bandwidth()/2+ xBand.bandwidth()*0.5)
        .attr("y1", d => yScale(d.high))
        .attr("y2", d => yScale(d.low))
        .attr("stroke", d => (d.open === d.close) ? "white" : (d.open > d.close) ?  "rgb(210, 60, 75)" : "rgb(30, 95, 210)")
        .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .7);		
            div.html(`
                    <b>${formatDate(d.date)}</b></br>
                    최대 : ${d.high} </br>
                    최소 : ${d.low} </br>
                    시가 : ${d.open} </br>
                    종가 : ${d.close} </br>
                    ${d.open - d.close}`)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });
    
    // draw rectangles
    let candles = chartBody.selectAll(".candle")
        .data(prices)
        .enter()
        .append("rect")
        .attr('x', (d, i) => xScale(i) - xBand.bandwidth()+ xBand.bandwidth()*0.5)
        .attr("class", "candle")
        .attr('y', d => yScale(Math.max(d.open, d.close)))
        .attr('width', xBand.bandwidth())
        .attr('height', d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close))-yScale(Math.max(d.open, d.close)))
        .attr("fill", d => (d.open === d.close) ? "silver" : (d.open > d.close) ? "rgb(210, 60, 75)" : "rgb(30, 95, 210)")
        .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .7);		
            div.html(`<b>${formatDate(d.date)}</b> </br>
                        최대 : ${d.high} </br>
                        최소 : ${d.low} </br>
                        시가 : ${d.open} </br>
                        종가 : ${d.close} </br>
                        ${d.open - d.close}`)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });
    
    //chart zoom했을때 rect set
    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w)
        .attr("height", h);
    
    //xGrid line function
    function make_x_gridlines() {		
        return d3.axisBottom(xScale)
            .ticks(5)
    }
    
    //yGrid line function
    function make_y_gridlines() {		
        return d3.axisLeft(yScale)
            .ticks(5)
    }

    const extent = [[0, 0], [w, h]];
    
    var zoom = d3.zoom()
        .scaleExtent([1, 100])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed)
        .on('zoom.end', zoomend);
    
    //zoom call
    svg.call(zoom)


    //zoom 시작 이벤트
    function zoomed() {
        
        var t = d3.event.transform;
        let xScaleZ = t.rescaleX(xScale);
        
        let hideTicksWithoutLabel = function() {
            d3.selectAll('.xAxis .tick text').each(function(d){
                if(this.innerHTML === '') {
                this.parentNode.style.display = 'none'
                }
            })
        }

        gX.call(
            d3.axisBottom(xScaleZ).tickFormat((d, e, target) => {
                if (d >= 0 && d <= dates.length-1) {
                    d = dates[d];
                    if(d == undefined) return;
                    return formatDate(d);
                }
            })
        )

        xGrid.call(
            d3.axisBottom(xScale)
                .scale(d3.event.transform.rescaleX(xScale))
                .ticks(5)
                .tickSize(-h)
                .tickFormat("")
            )

        

        candles.attr("x", (d, i) => xScaleZ(i) - (xBand.bandwidth()*t.k)/2)
                .attr("width", xBand.bandwidth()*t.k);
        stems.attr("x1", (d, i) => xScaleZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);
        stems.attr("x2", (d, i) => xScaleZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);

        
        hideTicksWithoutLabel();

    }

    // zoom 끝나는 시점 이벤트
    function zoomend() {
        var t = d3.event.transform;
        let xScaleZ = t.rescaleX(xScale);
        var xmin = new Date(xDateScale(Math.floor(xScaleZ.domain()[0])))
            xmax = new Date(xDateScale(Math.floor(xScaleZ.domain()[1])))
            filtered = prices.filter(d => ((d.date >= xmin) && (d.date <= xmax)))
            minP = +d3.min(filtered, d => d.low)
            maxP = +d3.max(filtered, d => d.high)
            buffer = Math.floor((maxP - minP) * 0.1)

        yScale.domain([minP - buffer, maxP + buffer]).range([h, 0]).nice();

        yGrid.transition().duration(500).call(
            d3.axisLeft(yScale)
                .ticks(5)
                .tickSize(-w)
                .tickFormat("")
        );

        candles.transition()
                .duration(500)
                .attr("y", (d) => yScale(Math.max(d.open, d.close)))
                .attr("height",  d => (d.open === d.close) ? 1 : yScale(Math.min(d.open, d.close))-yScale(Math.max(d.open, d.close)));
                
        stems.transition().duration(500)
                .attr("y1", (d) => yScale(d.high))
                .attr("y2", (d) => yScale(d.low))
        
        gY.transition().duration(500).call(d3.axisLeft().scale(yScale));

    }

}

drawChart();