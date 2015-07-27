'use strict';

var url = 'https://www.openice.info/files/github-downloads-data.txt';

function getDownloadsData (url, callback) {
    function parseDownloads (data) {
    //     var graphData = [];
    //     var distinctSeries = [];

    //     data.map(function (obj) {
    //         obj.assets.forEach(function (value, index, array) {
    //             if (!(distinctSeries.indexOf(value.name) > -1)) {
    //                 distinctSeries.push(value.name);
    //             }
    //         });
    //     });
    //     distinctSeries.sort();

    //     for (var i = 0; i < distinctSeries.length; i++) {
    //         var seriesData = {}
    //         seriesData.name = distinctSeries[i];
    //         seriesData.values = [];

    //         data.map(function (obj) {
    //             var date = obj.dateRetrieved;
    //             obj.assets.forEach(function (value, index, array) {
    //                 if (distinctSeries[i] == value.name) {
    //                     seriesData.values.push({
    //                         dateRetrieved: date,
    //                         download_count: value.download_count
    //                     });
    //                 }
    //             });
    //         });
    //         graphData.push(seriesData);
    //     }
    //     callback(graphData);

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
    console.log(data);

    // for (var i = 0; i < data.length; i++) {
    //     data[i].values.forEach(function (value, index, array) {
    //         value.dateRetrieved = d3.time.format.iso.parse(value.dateRetrieved) + 'banana';
    //         value.download_count = +value.download_count;
    //     });
    // }

    data.forEach(function (value, index, array) {
        value.dateRetrieved = d3.time.format.iso.parse(value.dateRetrieved);
        value.download_count = +value.download_count;
    });

    var th = window.innerHeight * 0.75;
    var tw = window.innerWidth * 0.75;

    var padding = 75;

    var h = th - padding * 2;
    var w = tw - padding * 2;

    var x = d3.time.scale().range([0, w]);
    var y = d3.scale.linear().range([h, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom");

    var yAxis = d3.svg.axis()
                      .scale(y)
                      .orient("left");

    var line = d3.svg.line()
                     // .interpolate("basis")
                     .x(function(d) { return x(d.dateRetrieved); })
                     .y(function(d) { return y(d.download_count); });

    var svg = d3.select("#graph-container")
                .append("svg")
                .attr("width", tw)
                .attr("height", th)
              .append("g")
                .attr("transform", "translate(" + padding + "," + padding + ")");

    var assets = d3.nest().key(function(d) {
        return d.series;
    })
    .entries(data);

    x.domain(d3.extent(data, function(d) { return d.dateRetrieved; }));
    y.domain([0, d3.max(data, function(d) { return d.download_count; })]);

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + h + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis);

    var asset = svg.selectAll(".asset")
                  .data(assets)
                .enter().append("g")
                  .attr("class", "asset");

    asset.append("path")
         .attr("class", "line")
         .attr("d", function(d) { return line(d.values); })
         .style("stroke", function(d) { return color(d.name); });

    // asset.append("text")
    //      .datum(function(d) { return {name: d.name, values: d.values[d.values.length - 1]}; })
    //      .attr("transform", function(d) { return "translate(" + x(d.values.dateRetrieved) + "," + y(d.values.download_count) + ")"; })
    //      .attr("x", 3)
    //      .attr("dy", ".35em")
    //      .text(function(d) { return d.name; });

    // svg.append("path")
    //    .datum(data)
    //    .attr("class", "line")
    //    .attr("d", line);

}

getDownloadsData(url, function (data) {
    graph(data);
});
