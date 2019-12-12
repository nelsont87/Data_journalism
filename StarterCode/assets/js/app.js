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
var chosenXAxis = "In Poverty (%)";
var chosenYAxis = "Obese";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]),
      d3.max(healthData, d => d[chosenXAxis])
    ])
    .range([0, width]);

  return xLinearScale;

};
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]),
      d3.max(healthData, d => d[chosenYAxis])
    ])
    .range([0, width]);

  return yLinearScale;

};

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1500)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1500)
    .call(leftAxis);

  return yAxis;
};

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {

  circlesXGroup.transition()
    .duration(1500)
    .attr("cx", function(d) { return newXScale(d[chosenXAxis])})
    .attr("cy", function(d) { return yScale(d[chosenYAxis])});

  return circlesXGroup;
}
// function renderCircles(circlesGroup, xScale, chosenXAxis, yScale, chosenYAxis) {

//   circlesGroup.transition()
//     .duration(1500)
//     .attr("cx", d => xScale(d[chosenXAxis]))
//     .attr("cy", d => yScale(d[chosenYAxis]));

//   return circlesGroup;
// }
function renderYCircles(circlesYGroup, newYScale, chosenYAxis) {

  circlesYGroup.transition()
    .duration(1500)
    .attr("cx", function(d) { return xScale(d[chosenXAxis])})
    .attr("cy", function(d) { return newYScale(d[chosenYAxis])});

  return circlesYGroup;
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "In Poverty (%)") {
    var labelX = "Poverty: ";
    var axisXName = "poverty";
  }
  else if (chosenXAxis === "Age (Median)") {
    var labelX = "Age (Median): ";
    var axisXName = "age";
  }
  else {
    var labelX = "Household Income (Median): ";
    var axisXName = "income";
  }
  if (chosenYAxis === "Obese (%)") {
    var labelY = "Obese: ";
    var axisYName = "obesity";
  }
  else if (chosenYAxis === "Smokes (%)") {
    var labelY = "Smokes: ";
    var axisYName = "smokes";
  }
  else {
    var labelY = "Lacks Healthcare (%): ";
    var axisYName = "healthcare";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state} <br> ${labelX} ${d.axisXName} <br> ${labelY} ${d.axisYName}`);
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
};


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then (function(healthData) {
  console.log(healthData);

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xLinearScale(d[chosenXAxis]) })
    .attr("cy", function(d) { returnyLinearScale(d[chosenYAxis]) })
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var inPoverty = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageM = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeM = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis

  var labelsYGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("transform", `translate(${width - margin.left}, ${height/2})`);

  var obeseP = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var smokeP = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareL = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsXGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var valueX = d3.select(this).attr("value");
      if (valueX !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = valueX;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          inPoverty
            .classed("active", true)
            .classed("inactive", false);
          ageM
            .classed("active", false)
            .classed("inactive", true);
          incomeM
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          inPoverty
            .classed("active", false)
            .classed("inactive", true);
          ageM
            .classed("active", true)
            .classed("inactive", false);
          incomeM
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          inPoverty
            .classed("active", false)
            .classed("inactive", true);
          ageM
            .classed("active", false)
            .classed("inactive", true);
          incomeM
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });  
    
    labelsYGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var valueY = d3.select(this).attr("value");
        if (valueY !== chosenYAxis) {
  
          // replaces chosenXAxis with value
          chosenYAxis = valueY;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(healthData, chosenYAxis);
  
          // updates x axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          // updates circles with new x values
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "obesity") {
            obeseP
              .classed("active", true)
              .classed("inactive", false);
            smokeP
              .classed("active", false)
              .classed("inactive", true);
            healthcareL
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            obeseP
              .classed("active", false)
              .classed("inactive", true);
            smokeP
              .classed("active", true)
              .classed("inactive", false);
            healthcareL
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "healthcare") {
            obeseP
              .classed("active", false)
              .classed("inactive", true);
            smokeP
              .classed("active", false)
              .classed("inactive", true);
            healthcareL
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    });
