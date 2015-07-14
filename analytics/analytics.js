'use-strict';
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));

MongoClient.connect('mongodb://127.0.0.1:27017/github-downloads', function(err, db) {
    assert.equal(null, err);

    db.collection('downloads').find({}).toArray(function(err, result) {
        assert.equal(null, err);
        assert.ok(result.length);

        fs.writeFile('github-downloads-data.txt', JSON.stringify(result), function (err) {
            assert.equal(null, err);

            console.log('wrote to a file');
        });

        db.close();
    });
});
