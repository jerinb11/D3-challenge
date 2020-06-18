// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
// change color after clicking on the titles on the x-axis
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    var color;
    if (chosenXAxis === "poverty"){
        color = "teal"
    }
    else {
        color = "pink"
    }
  circlesGroup.transition()
    .duration(1000)
    .attr("fill",color)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis) {

    textGroup.transition()
      .duration(1000)
    //   +/-10 is to center the state abbreviations
      .attr("x", d => newXScale(d[chosenXAxis])-10);
  
    return textGroup;
  }
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Hair Length:";
  }
  else {
    label = "# of Albums:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data - making sure these specific numbers are numeric instead of string
  data.forEach(function(dt) {
    dt.poverty = +dt.poverty;
    dt.healthcare = +dt.healthcare;
    dt.income = +dt.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .text(d=>d.abbr)
    // color of bubbles
    .attr("fill", "teal")
    .attr("opacity", ".5");

    // text abbreviations for the circles
    var textGroup = chartGroup.selectAll("text.abbr")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis])-10)
    .attr("y", d => yLinearScale(d.healthcare)+4)
    .attr("class", "abbr")
    .text(d=>d.abbr);

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
//   var labelsGroup = chartGroup.append("g")
//   .attr("transform", `translate(${width / 2}, ${height + 20})`);

  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    // .classed("axis-text", true)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

    // do swap functions on the y-axis

//   chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 40 - margin.left)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     // .classed("axis-text", true)
//     .attr("value", "age") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Age");

  // updateToolTip function above csv import
//   var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
//   toggling between the two labels for shifting the data
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis)

        // updates tooltips with new info
        // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});