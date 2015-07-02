'use strict';
var argv = require('minimist')(process.argv.slice(2));
var https = require('https');
var MongoClient = require('mongodb').MongoClient;

// var user;   // username or org name

// var arg_handler = {
//     'user': ['u', 'user'],
//     'repo': ['r', 'repo'],
//     'user_agent': ['a', 'user_agent']
// };

// for(var key in arg_handler) {
//     var found = false;
//     var self = this;
//     arg_handler[key].forEach(function(val, idx, arr) {
//         if(argv[val]) {
//             found = true;
//             self[key] = argv[val];
//         }
//     });
//     if(!found) {
//         console.error("Please specify a " + key);
//         process.exit(1);
//     }
// }
// console.log(this.user);

// if (argv.u || argv.user || argv.r || argv.repo || argv.a || argv.user_agent) {
//     user = argv.u || argv.user;
// } else {
//     console.error('Please enter a GitHub user/org name');
//     process.exit(1);
// };
var user = argv.u || argv.user;
var repo = argv.r || argv.repo;   // github repo with releases
var user_agent = argv.a || argv.user_agent;   // github API required header
var verbose = argv.v || argv.verbose;

if (verbose) {
    console.log('Running with settings:\n'+
                'user: ' + user + '\n'+
                'repo: ' + repo + '\n'+
                'user_agent: ' + user_agent);
};

var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/' + user + '/' + repo + '/releases',
    method: 'GET',
    headers: {
        'User-Agent': user_agent
    }
};

function callback (response) {
    var body = '';

    if (verbose) {
        console.log("HTTP response statusCode: ", response.statusCode);
        console.log("HTTP response headers: ", response.headers);
    };

    response.on('data', function (chunk) {
        body += chunk;
    });

    response.on('end', function () {
        // console.log(JSON.parse(body));
        writeToMongo(JSON.parse(body));
    });
}
// https.request(options, callback).end();

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

    console.log('Attempting to write the following httpResponse to Mongo:\n', httpResponse);
    // console.log('asset ', httpResponse[0].assets);

    MongoClient.connect('mongodb://127.0.0.1:27017/github-downloads', function(err, db) {
        if (err) { console.log('\n*ERROR* connecting to Mongo database'); throw err };
        if (verbose) { console.log('Connected to Mongo database') };

        db.collection('downloads').insert(httpResponse, function(err, docs) {
            if (err) { console.log('\n*ERROR* inserting into Mongo database'); throw err };
            if (verbose) { console.log('Downloads data successfully inserted.') };
            db.close();
        });
    });
}