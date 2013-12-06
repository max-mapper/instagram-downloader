#!/usr/bin/env node

var Downloader = require('./')
var argv = require('optimist').argv;

argv.term = argv._[0]

var dl = new Downloader(argv)
