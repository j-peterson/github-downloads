'use-strict';
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
// var argv = require('minimist')(process.argv.slice(2));
var port = 8888;

MongoClient.connect('mongodb://127.0.0.1:27017/github-downloads', function(err, db) {
    assert.equal(null, err);

    db.collection('downloads').find({}).toArray(function(err, result) {
        assert.equal(null, err);
        assert.ok(result.length);

        console.log(result);

        db.close();
    });
});

// function serverResponse(request, response) {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.write('Hello, World!');
//     response.end();
// }

// http.createServer(serverResponse).listen(port, function() {
//     console.log('Server listening on: http://localhost:', port);
// });


