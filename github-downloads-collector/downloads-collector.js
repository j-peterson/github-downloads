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
    path: '/repos/' + user + '/' + repo + '/releases/latest',
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

    delete httpResponse.body;

    // delete all supplimentary urls containing "_url"
    function deleteUrls (httpResponse) {
        for (var key in httpResponse) {
            if (typeof httpResponse[key] === 'object') {
                deleteUrls(httpResponse[key]);
            } else if (/_url/.test(key)) {
                delete httpResponse[key];
            }
        }
    }
    deleteUrls(httpResponse);
    // console.log(httpResponse);


    MongoClient.connect(mongoUrl, function(err, db) {
        if(err) { throw err };
        console.log('connected to database');

        var downloads = db.collection('downloads');

        console.log('db: ', db);
        console.log('downloads: ', downloads);
        
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