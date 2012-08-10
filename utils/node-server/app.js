// Load external node.js modules
var express = require('express')
, http = require('http')
, fs = require('fs')
, config = require('./config');

// Express framework settings
var app = express();
app.configure(function(){
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
});
app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
    fs.readFile(__dirname + '/../../index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

app.get('/doc.js', function(req, res){
    fs.readFile(__dirname + '/../../doc.js', 'utf8', function(err, text){
	res.setHeader('Content-Type', "text/javascript");
        res.send(text);
    });
});

app.get('/cannon.js', function(req, res){
    fs.readFile(__dirname + '/../../cannon.js', 'utf8', function(err, text){
	res.setHeader('Content-Type', "text/javascript");
        res.send(text);
    });
});

app.get('/libs/pagedown/Markdown.Converter.js', function(req, res){
    fs.readFile(__dirname + '/../../libs/pagedown/Markdown.Converter.js', 'utf8', function(err, text){
	res.setHeader('Content-Type', "text/javascript");
        res.send(text);
    });
});

app.get('/libs/pagedown/Markdown.Sanitizer.js', function(req, res){
    fs.readFile(__dirname + '/../../libs/pagedown/Markdown.Sanitizer.js', 'utf8', function(err, text){
	res.setHeader('Content-Type', "text/javascript");
        res.send(text);
    });
});

app.get('/README.markdown', function(req, res){
    fs.readFile(__dirname + '/../../README.markdown', 'utf8', function(err, text){
	//res.setHeader('Content-Type', "text/javascript");
        res.send(text);
    });
});

// Start Webserver
var server = http.createServer(app).listen(config.port);
console.log("Express server listening on port "+config.port);
