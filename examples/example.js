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
    console.log(data);

    // function parseDate (date) {
    //     return Date.parse(date);
    // }

    var th = window.innerHeight * 0.75;
    var tw = window.innerWidth * 0.75;

    var padding = 75;

    var h = th - padding * 2;
    var w = tw - padding * 2;

    var downloads = d3.select("#graph-container")
        .append("svg:svg")
        .attr("width", tw)
        .attr("height", th);

    // var x = d3.time.scale().domain().range([0, w]);
    var y = d3.scale.linear().domain([0, d3.max(data, function(datum) { return datum.download_count; })]).range([0, h]);




}

getDownloadsData(url, function (data) {
    graph(data);
});
