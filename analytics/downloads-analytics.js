'use-strict';
var http = require('http');
var urlParse = require('url').parse;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || argv.port;
assert.ok(port > 0 && port < 49151);

// MongoClient.connect('mongodb://127.0.0.1:27017/github-downloads', function(err, db) {
//     assert.equal(null, err);

//     db.collection('downloads').find({}).toArray(function(err, result) {
//         assert.equal(null, err);
//         assert.ok(result.length);

//         console.log(result);

//         db.close();
//     });
// });

function serverResponse(request, response) {

    request.on('close', function () {
        // stop?
    });

    if (request.method === 'GET') {

        // console.log(urlParse(request.url, true));
        // console.log(urlParse(request.url).pathname);

        switch(urlParse(request.url).pathname) {
            case '/downloads':
            case '/downloads/':
                response.statusCode = 200;
                response.write('WRITE DOWNLOADS DATA TO WRITEABLE STREAM HERE');
                break;
            default:
                response.statusCode = 404;
        }

        // Leave out response.writeHead() to use implicit header mode and flush the implicit headers
        // response.writeHead(200, {"Content-Type": "text/plain"});
        
    }

    response.end(); // response.end([data][, encoding][, callback])
}

http.createServer(serverResponse).listen(port, function() {
    console.log('Server listening on: http://localhost:', port);
});


