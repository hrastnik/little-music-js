var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');

app.use(express.static('.'));
//app.use(express.static('js'));

app.get('/', function (req, res) {
    console.log("Serving file index.html");
    res.sendFile('index.html', { root: path.join(__dirname) });
});

var port = process.env.PORT || 3333;

server.listen(port, function (err) {
    if (err) throw err;
    console.log('App server listening on port ', port, '!');
});
