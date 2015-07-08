'use-strict';
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var argv = require('minimist')(process.argv.slice(2));




// listen for REST gets for downloads data
// query mongo for downloads data
// post data