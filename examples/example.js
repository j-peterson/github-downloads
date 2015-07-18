'use strict';

function getDownloadsData (callback) {
    d3.json('https://www.openice.info/files/github-downloads-data.txt', function (err, data) {
        if (err) {
            d3.json('example-data.json', function (err, data) {
                if (err) throw err;
                console.log('Using backup data');
                callback(data);
            });
        } else {
            callback(data);
        }
    });
}

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
    })

    console.log(flattenedData);
}


var downloads = getDownloadsData(parseDownloads);

