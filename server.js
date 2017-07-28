// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

var csv = require("fast-csv");
var apiaiHandler = require('./apiai/actions');

var talks = [];
csv.fromPath("./data/FARCON2017Schedule.csv", {headers:true})
   .on("data", function(data){
     talks.push(data);
   })
   .on("end", function(){
     console.log("done");
   });


// Use body parser to get JSON from requests
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/apiai", function (request, response) {
  console.log(request.body);
  apiaiHandler(request, response, talks);
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
