const margin = ({top: 20, right: 30, bottom: 30, left: 40});
const width = 2000;
const height = 625;
        
var formatDate = d3.utcFormat("%B %-d, %Y");
var formatValue = d3.format(".2f");
var formatChange = function() {
    const f = d3.format("+.2%");
    return (y0, y1) => f((y1 - y0) / y0);
  }
var parseDate = d3.utcParse("%Y-%m-%d")


// var data = d3.data(jsonData, d=>{
//     const date = parseDate(d["Date"]);
//     return {
//       date,
//       high: +d["High"],
//       low: +d["Low"],
//       open: +d["Open"],
//       close: +d["Close"]
//     };
// })

var data = jsonData["values"];
data = data.map(d=>{
    return {
        date : parseDate(d["date"]),
        high: +d["high"],
        low: +d["low"],
        open: +d["open"],
        close: +d["close"]
    }
}); 
console.log(data)
//var data = jsonData["values"];

var x = d3.scaleBand()
        .domain(d3.utcDay
            .range(data[0].date, +data[data.length - 1].date + 1)
            .filter(d => d.getUTCDay() !== 0 && d.getUTCDay() !== 6))
        .range([margin.left, width - margin.right])
        .padding(0.2)

var y = d3.scaleLog()
        .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
        .rangeRound([height - margin.bottom, margin.top])

var xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickValues(d3.utcMonday
                .every(width > 720 ? 1 : 2)
                .range(data[0].date, data[data.length - 1].date))
            .tickFormat(d3.utcFormat("%-m/%-d")))
        .call(g => g.select(".domain").remove());

var yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .tickFormat(d3.format("$~f"))
            .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", width - margin.left - margin.right))
        .call(g => g.select(".domain").remove());

var chart = function() {
    const svg = d3.select("#container")
                .attr("viewBox", [0, 0, width, height]);
                // .attr("width", width + margin.left + margin.right)
                // .attr("height", height + margin.top + margin.bottom)   
    
                //

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    const g = svg.append("g")
        .attr("stroke-linecap", "round")
        .attr("stroke", "black")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => "translate("+x(d.date)+",0)");

    g.append("line")
        .attr("y1", d => y(d.low))
        .attr("y2", d => y(d.high));

    g.append("line")
        .attr("y1", d => y(d.open))
        .attr("y2", d => y(d.close))
        .attr("stroke-width", x.bandwidth())
        .attr("stroke", d => d.open > d.close ? d3.schemeSet1[0]
            : d.close > d.open ? d3.schemeSet1[2]
            : d3.schemeSet1[8]);

    g.append("title")
        .text(d => `${formatDate(d.date)}
        Open: ${formatValue(d.open)}
        Close: ${formatValue(d.close)} (${formatChange(d.open, d.close)})
        Low: ${formatValue(d.low)}
        High: ${formatValue(d.high)}`);

        return svg.node();
}
chart();