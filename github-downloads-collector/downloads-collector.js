'use strict';
var argv = require('minimist')(process.argv.slice(2));
var https = require('https');
var MongoClient = require('mongodb').MongoClient;

var cli = {};
var verbose = argv.v || argv.verbose;

var arg_handler = {
    'user': ['u', 'user'],
    'repo': ['r', 'repo'],
    'user_agent': ['a', 'user_agent']
};

for (var key in arg_handler) {
    try {
        arg_handler[key].forEach(function (value, index, array) {
            if (!cli[key]) cli[key] = argv[value];
        });
        if (!cli[key]) throw new Error('Please specify a ' + key);
    } catch (exception) {
        console.error(exception);
        process.exit(1);
    }
}

if (verbose) {
    console.log('Running with settings:\n'+
                'user: ' + cli.user + '\n'+
                'repo: ' + cli.repo + '\n'+
                'user_agent: ' + cli.user_agent);
}

var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/' + cli.user + '/' + cli.repo + '/releases',
    method: 'GET',
    headers: {
        'User-Agent': cli.user_agent
    }
};

function callback (response) {
    var body = '';

    if (verbose) {
        console.log("HTTP response statusCode: ", response.statusCode);
        console.log("HTTP response headers: ", response.headers);
    }

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

        // delete author objs, uploader objs, and supplimentary urls
        function deleteExtraInfo (httpResponse) {
            for (var key in httpResponse) {
                if (key.indexOf('author') > -1 ||
                    key.indexOf('uploader') > -1 ||
                    key.indexOf('url') > -1 ) {
                    delete httpResponse[key];
                } else if (typeof httpResponse[key] === 'object') {
                    deleteExtraInfo(httpResponse[key]);
                }
            }
        }
        deleteExtraInfo(httpResponse[index]);
    });

    if (verbose) console.log('Attempting to write the following httpResponse to Mongo:\n', httpResponse);

    MongoClient.connect('mongodb://127.0.0.1:27017/github-downloads', function(err, db) {

        if (err) {
            console.error('\n*ERROR* connecting to Mongo database\n');
            process.exit(1);
        }

        if (verbose) console.log('Connected to Mongo database');

        db.collection('downloads').insert(httpResponse, function(err, docs) {

            if (err) {
                console.error('\n*ERROR* inserting into Mongo database\n');
                process.exit(1);
            }

            if (verbose) { console.log('Downloads data successfully inserted.') }
            db.close();
        });
    });
}