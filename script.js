USEducationData = d3.json(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
);
USCountyData = d3.json(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
);
const width = 1200;
const height = 600;
const pathGenerator = d3.geoPath();
const svg = d3.create("svg").attr("width", width).attr("height", height);
const legend = svg.append("g").attr("id", "legend");
const legendColors = [
  "#FF4500",
  "#FF6347",
  "#FF7F50",
  "#FFA07A",
  "#FFDAB9",
  "#F0E68C",
  "#ADFF2F",
  "#32CD32",
];
const tooltip = d3
  .select("#mapHolder")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);
Promise.all([USEducationData, USCountyData]).then(
  ([EducationData, CountyData]) => {
    const countyEducation = EducationData.reduce((accumulator, d) => {
      accumulator[d.fips] = {
        bachelorsOrHigher: d.bachelorsOrHigher,
        areaName: d.area_name,
        state: d.state,
      };
      return accumulator;
    }, {});
    const counties = topojson.feature(CountyData, CountyData.objects.counties);
    svg
      .selectAll("path")
      .data(counties.features)
      .enter()
      .append("path")
      .attr("d", (d) => {
        return pathGenerator(d);
      })
      .attr("class", "county")
      .attr("data-fips", (d) => {
        return d.id;
      })
      .attr("data-education", (countyData) => {
        return countyEducation[countyData.id].bachelorsOrHigher;
      })
      .style("fill", (d) => {
        let bachelors = countyEducation[d.id].bachelorsOrHigher;
        switch (true) {
          case bachelors <= 10:
            return legendColors[0];
          case bachelors <= 20:
            return legendColors[1];
          case bachelors <= 30:
            return legendColors[2];
          case bachelors <= 40:
            return legendColors[3];
          case bachelors <= 50:
            return legendColors[4];
          case bachelors <= 60:
            return legendColors[5];
          case bachelors <= 70:
            return legendColors[6];
          case bachelors <= 80:
            return legendColors[7];
          default:
            break;
        }
      })
      .attr("transform", `translate(${width / 10},10)`)
      .on("mouseover", (event, data) => {
        //tooltip
        tooltip
          .style("opacity", 0.9)
          .attr("data-fips", () => {
            return data.id;
          })
          .attr("data-education", () => {
            return countyEducation[data.id].bachelorsOrHigher;
          })
          .html(
            `${countyEducation[data.id].areaName}<br>
          ${countyEducation[data.id].state}<br>
          ${countyEducation[data.id].bachelorsOrHigher}%`
          )
          .style("left", `${event.pageX - 50}px`)
          .style("top", `${event.pageY - 90}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0).style("left", `0px`).style("top", `0px`);
      });
    //create legend
    const bachelors = EducationData.map((d) => {
      return d.bachelorsOrHigher;
    });
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bachelors) + 6])
      .range([0, 300]);
    const xAxis = d3.axisLeft(yScale).tickValues(yScale.ticks(8.5));
    legend.call(xAxis).attr("transform", "translate(100,10)");
    legend
      .selectAll(".legendRect")
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("width", 30)
      .attr("height", 42)
      .attr("y", (d, i) => {
        return yScale(i * 10);
      })
      .attr("transform", "translate(1,0)")
      .style("fill", (d) => {
        return d;
      })
      .attr("class", "legendRect");
  }
);
mapHolder.append(svg.node());
