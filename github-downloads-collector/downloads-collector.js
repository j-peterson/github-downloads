'use strict';

var https = require('https');
var MongoClient = require('mongodb').MongoClient;

var mongoUrl = 'mongodb://127.0.0.1:27017/github-downloads';
var user = 'mdpnp';   // username or org name
var repo = 'mdpnp';
var api_user_agent = 'openice';

var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/' + user + '/' + repo + '/releases',
    method: 'GET',
    headers: {
        'User-Agent': api_user_agent
    }
};

function callback (response) {
    var body = '';

    console.log("statusCode: ", response.statusCode);
    // console.log("headers: ", response.headers);

    response.on('data', function (chunk) {
        body += chunk;
    });

    response.on('end', function () {
        // console.log(JSON.parse(body));
        writeToMongo(JSON.parse(body));
    });
}
https.request(options, callback).end();

function writeToMongo (httpResponse) {

    httpResponse.forEach(function (release, index, httpResponse) {

        delete httpResponse[index].body;

        // delete all supplimentary urls containing "_url"
        function deleteUrls (httpResponse) {
            for (var key in httpResponse) {
                if (key.indexOf('author') > -1 ||
                    key.indexOf('uploader') > -1 ) {
                    delete httpResponse[key];
                } else if (typeof httpResponse[key] === 'object') {
                    deleteUrls(httpResponse[key]);
                } else if (key.indexOf('url') > -1 ) {
                    delete httpResponse[key];
                }
            }
        }
        deleteUrls(httpResponse[index]);
    });

    // console.log('httpResponse ', httpResponse);
    // console.log('asset ', httpResponse[0].assets);



    MongoClient.connect(mongoUrl, function(err, db) {
        if(err) { throw err };
        console.log('connected to database');

        var downloads = db.collection('downloads');
        
        downloads.find({}).toArray(function (err, docs) {
            if (err) { throw err };
            console.log('find({}) returned:');
            console.dir(docs);
        });

        downloads.insert(httpResponse, function(err, docs) {
            if (err) { throw err };
            console.log('I think it inserted httpResponse');
            db.close();
        });
    });
}