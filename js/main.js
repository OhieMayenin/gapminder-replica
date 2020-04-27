/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

// Configure canvas // 

const margins = {left:80, right:20, bottom:100, top:50};
const width = 800 - margins.left - margins.right;
const height = 500 - margins.top - margins.bottom;

var g = d3.select("#chart-area")
.append("svg")
.attr("width", width + margins.left + margins.right)
.attr("height", height + margins.top + margins.bottom)
.append("g")
.attr("transform", "translate(" + margins.left + ", " + margins.top + ")");

// X scale
var xScale = d3.scaleLog()
.base(10)
.domain([142, 150000])
.range([0, width]);
// .domain([0, d3.max(formattedData, d => { d.income })])

// Y scale
var yScale = d3.scaleLinear()
.domain([0, 90])
.range([height, 0]);
// .domain([0, d3.max(formattedData, d => { d.life_exp })])

// Continent hue
var continentHue = d3.scaleOrdinal()
.domain(["asia", "americas", "europe", "africa"])
.range(d3.schemePastel2);

// Population bubble radius
var popScale = d3.scaleLinear()
.domain([2000, 1400000000])
.range([5**2, 35**2]);
// .domain(0, d3.max(formattedData, d => { d.population }))

// Labels
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy (Years)")
var timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 70)
    .attr("font-size", "25px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
	.text("1800");
	

// X Axis
var xAxisCall = d3.axisBottom(xScale)
.tickValues([400, 4000, 40000])
.tickFormat(d3.format("$"));
g.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height +")")
.call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(yScale)
.tickFormat((d) => { return +d; });
g.append("g")
.attr("class", "y axis")
.call(yAxisCall);

var time = 0;

// Read and process data //

d3.json("data/data.json").then(function(data){

	// console.log(data);

	// Clean data //
	const formattedData = data.map( item => {return item["countries"].filter(
		country => {
			return (country.income && country.life_exp && country.population);
		}).map(
			country => {
				country.life_exp = +country.life_exp;
				country.income = +country.income;
				country.population = +country.population;
				return country;
			});
	});

	console.log(formattedData[0]);

	d3.interval( () =>{
		time = (time < 214) ? time+1 : 0
		update(formattedData[time]);
    }, 100);

	update(formattedData[0]) // render first year
});

function update(data) {
	var t = d3.transition()
	.duration(100);

    // bubble chart
    var bubbles = g.selectAll("circle").data(data, function(d){
        return d.country;
    });
 
    // EXIT old elements not present in new data.
    bubbles.exit()
        .attr("class", "exit")
        .remove();
 
	// ENTER new elements present in new data.
	bubbles.enter()
		.append("circle")
		.attr("class", "enter")
		.attr("fill", (d) => {return continentHue(d.continent)})
		.merge(bubbles)
		.transition(t) // attributes under here will transition
			.attr("r", (d) => {return Math.sqrt(popScale(d.population))})
			.attr("cx", (d) => {return xScale(d.income)})
			.attr("cy", (d) => {return yScale(d.life_exp)});

	timeLabel.text(1800+time)
}
