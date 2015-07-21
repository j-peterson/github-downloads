'use strict';

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

    var width = 750;
    var height = 500;
    var padding = 50;

    // var x = d3.time.scale().domain().range();
    // var y = d3.scale.linear().domain().range();





}

var url = 'https://www.openice.info/files/github-downloads-data.txt';

getDownloadsData(url, function (data) {
    graph(data);
});
