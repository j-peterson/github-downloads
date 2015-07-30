'use strict';

var url = 'https://www.openice.info/files/github-downloads-data.txt';

function getDownloadsData (url, callback) {
    function parseDownloads (data) {
        var formattedData = data.map(function (obj) {
            var newInsert = [];
            obj.assets.forEach(function (value, index, array) {
                var newObj = {};
                newObj.dateRetrieved = obj.dateRetrieved;
                newObj.series = value.name;
                newObj.download_count = value.download_count;
                newInsert.push(newObj);
            });
            return newInsert;
        });

        var flattenedData = formattedData.reduce(function (a, b) {
            return a.concat(b);
        });

        callback(flattenedData);
    }

    d3.json(url, function (err, data) {
        if (err) {
            d3.json('example-data.json', function (err, data) {
                if (err) throw err;
                console.log('Using backup data');
                parseDownloads(data);
            });
        } else {
            parseDownloads(data);
        }
    });
}

function graph (data) {
    var assets = d3.nest().key(function (d) { return d.series; }).entries(data);

    data.forEach(function (value) {
        value.dateRetrieved = d3.time.format.iso.parse(value.dateRetrieved);
        value.download_count = +value.download_count;
    });

    var th = window.innerHeight * 0.75;
    var tw = window.innerWidth * 0.75;

    (window.innerWidth < 700) ? tw = 700 : tw;

    var margin = { top:75, right:200, bottom:75, left:75 };

    var h = th - (margin.top + margin.bottom);
    var w = tw - (margin.left + margin.right);

    var xScale = d3.time.scale()
                    .range([0, w])
                    .domain(d3.extent(data, function(d) { return d.dateRetrieved; }));
    var yScale = d3.scale.linear()
                    .range([h, 0]);

    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .tickSize(-h, 0);

    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

    var stack = d3.layout.stack()
                  .offset("zero")
                  .values(function (d) { return d.values; })
                  .x(function (d) { return xScale(d.dateRetrieved); })
                  .y(function (d) { return d.download_count; })
                  .order("reverse");
    stack(assets);

    var maxy = 0;
    assets.forEach(function (v) {
        v.values.forEach(function (d) { maxy = ((d.y + d.y0) > maxy ? (d.y + d.y0) : maxy); });
    });
    yScale.domain([0, maxy]);

    var area = d3.svg.area()
                 .interpolate("linear")
                 .x(function (d) { return xScale(d.dateRetrieved); })
                 .y0(function (d) { return yScale(d.y0); })
                 .y1(function (d) { return yScale(d.y0 + d.y); });

    var line = d3.svg.line()
                     .interpolate("linear")
                     .x(function(d) { return xScale(d.dateRetrieved); })
                     .y(function(d) { return yScale(d.download_count); });

    var color = d3.scale.category20();

    var svg = d3.select("#graph-container")
                .append("svg")
                .attr("width", tw)
                .attr("height", th)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var asset = svg.selectAll(".asset")
                   .data(assets)
                 .enter().append("g")
                   .attr("class", "asset");

    asset.append("path")
         .attr("class", "path")
         .attr("d", function (d) { return area(d.values); })
         .style("fill", function (d) { return color(d.key); })
         .style("stroke", "#333");

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + h + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
     .append("text")
       .attr("transform", "rotate(-90)")
       .attr("dy", "-3em")
       .style("text-anchor", "end")
       .text("download_count");

    asset.append("text")
         .datum(function(d) { return { key: d.key, values: d.values[d.values.length - 1] }; })
         .attr("transform", function(d) { return "translate(" + xScale(d.values.dateRetrieved) + "," + yScale(d.values.y + d.values.y0) + ")"; })
         .attr("x", 3)
         .attr("dy", ".35em")
         .text(function(d) { return d.key; })
         .style("fill", function (d, i) { return color(d.key); });
}

getDownloadsData(url, function (data) {
    graph(data);
});
