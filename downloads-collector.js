'use strict';
var argv = require('minimist')(process.argv.slice(2));
var MongoClient = require('mongodb').MongoClient;
var https = require('https');
var assert = require('assert');
var fs = require('fs');
var cli = {};
var arg_handler = {
    'user': ['u', 'user'],
    'repo': ['r', 'repo'],
    'user_agent': ['a', 'user_agent']
};
cli.verbose = argv.v || argv.verbose;

// read the command line argv and assign keys found in arg_handler to cli object
for (var key in arg_handler) {
    try {
        arg_handler[key].forEach(function (value, index, array) {
            if (!cli[key]) cli[key] = argv[value];
        });
        if (!cli[key]) {
            // throw new Error('Please specify a ' + key);
            console.error('Please specify a ' + key);
            process.exit(1);
        }
    } catch (exception) {
        console.error(exception);
        process.exit(1);
    }
}

if (cli.verbose) {
    console.log('Running with settings:\n'+
                'user: ' + cli.user + '\n'+
                'repo: ' + cli.repo + '\n'+
                'user_agent: ' + cli.user_agent);
}

var httpOptions = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/' + cli.user + '/' + cli.repo + '/releases',
    headers: {
        'User-Agent': cli.user_agent
    }
};

function httpCallback (response) {
    var content = '';

    if (cli.verbose) {
        console.log('HTTP response statusCode: ', response.statusCode);
        console.log('HTTP response headers: ', response.headers);
    }

    if (response.statusCode !== 200) {
        throw new Error(response.statusCode + ': ' + response.statusMessage);
    }

    response
        .on('error', function (err) {
            throw new Error(err);
        })
        .on('end', function () {
            formatHttpResponse(content);
        })
        .on('data', function (chunk) {
            content += chunk;
        });
}

// formatHttpResponse accepts the http reponse content as string
function formatHttpResponse (rawResponse) {
    try {
        var httpResponse = JSON.parse(rawResponse);
    } catch (exception) {
        console.error('JSON.parse error');
        console.error(exception);
        process.exit(1);
    }

    // delete unneeded information like author objs, uploader objs, and supplimentary urls
    httpResponse.forEach(function (release, index, httpResponse) {
        delete httpResponse[index].body;
        delete httpResponse[index].author;
        delete httpResponse[index].published_at;
        delete httpResponse[index].target_commitish;
        (function deleteExtraInfo (httpResponse) {
            for (var key in httpResponse) {
                if (key.indexOf('url')      > -1 ||
                    key.indexOf('uploader') > -1 ||
                    key.indexOf('updated_at')>-1 ||
                    key.indexOf('state')    > -1 ||
                    key.indexOf('label')    > -1 ||
                    key.indexOf('size')     > -1 ||
                    key.indexOf('content_type') > -1) {
                        delete httpResponse[key];
                } else if (typeof httpResponse[key] === 'object') {
                    deleteExtraInfo(httpResponse[key]);
                }
            }
        })(httpResponse[index])
    });
    writeToMongo(httpResponse);
}

// writeToMongo accepts an object and attempts to write it to a local mongo instance
function writeToMongo (httpResponse) {
    if (cli.verbose) console.log('Attempting to write to Mongo');

    MongoClient.connect('mongodb://127.0.0.1:27017/github-downloads', function(err, db) {
        assert.equal(null, err);

        if (cli.verbose) console.log('Connected to Mongo database');

        db.collection('downloads').insert(httpResponse, function(err, docs) {
            assert.equal(null, err);

            var today = new Date();
            console.log('Successful inserted at ' + today.toUTCString());

            db.collection('downloads').find({}).toArray(function(err, result) {
                assert.equal(null, err);
                assert.ok(result.length);

                fs.writeFile('openice/github-downloads-data.txt', JSON.stringify(result), function (err) {
                    assert.equal(null, err);

                    if (verbose) console.log('Successful file write');
                });

                db.close();
            });
        });
    });
}

https.get(httpOptions, httpCallback);
