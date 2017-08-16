// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var moment = require('moment');
var db = require('monk')(process.env.MONGODB_URI);
var messages = db.get('messages');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

var csv = require("fast-csv");
var apiaiHandler = require('./apiai/actions');

var talks = [];
var rooms = [];
var uniqueTalks = [];
var speakers = [];
var organizations = [];
var farconData = {};

csv.fromPath("./data/FARCON2017ScheduleOrdered.csv", {headers:true})
   .on("data", function(t){
     t.StartTimeMoment = moment(`2017-08-24 ${t.StartTime}`);
     t.EndTimeMoment = moment(`2017-08-24 ${t.EndTime}`);
     talks.push(t);
    
   })
   .on("end", function(){
     rooms = buildRooms(talks);
     uniqueTalks = buildUniqueTalks(talks);
     speakers = buildSpeakers(talks);
     farconData.talks = talks;
     farconData.rooms = rooms;
     farconData.uniqueTalks = uniqueTalks;
     farconData.speakers = speakers;
     //console.log(uniqueTalks);
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
  messages.insert(request.body);
  apiaiHandler(request, response, farconData);
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

function buildPresenterList(filteredTalks) {
  return filteredTalks.reduce((message, presenter, index, presenterArray) => {
    if (index === 0) {
      return `${presenter.FullName}`;
    } else if (index === presenterArray.length-1) {
      return `${message} and ${presenter.FullName}`;
    } else {
      return `${message}, ${presenter.FullName}`;
    }
  }, '');
}

function buildUniqueTalks(talks) {
  var rooms = [];
  var timeList = [];
  
  // Find unique list of rooms
  var roomList = talks.map((t) => {
    return t.Room;
  }).filter((value, index, self) => { 
    return self.indexOf(value) === index;
  });
  
  // Find unique list of times
  var timeList = talks.map((t) => {
    return t.StartTime;
  }).filter((value, index, self) => { 
    return self.indexOf(value) === index;
  });
  
  var uniqueTalks = roomList.reduce((list, r) => {
    var talksInRoom = talks.filter((t) => {
      return t.Room === r;
    });
    timeList.map((time) => {
      var uniqueTalkList = talksInRoom.filter((t) => {
        return t.StartTime === time;
      });
      if (uniqueTalkList.length > 0) {
        uniqueTalkList[0].numOfPresenters = uniqueTalkList.length;
        uniqueTalkList[0].Presenters = buildPresenterList(uniqueTalkList);
        list.push(uniqueTalkList[0])
      }
      return;
    })
    return list;
  }, []);
  return uniqueTalks;
}

function buildRooms(talks) {
  var rooms = [];
  var timeList = [];
  
  // Find unique list of rooms
  var roomList = talks.map((t) => {
    return t.Room;
  }).filter((value, index, self) => { 
    return self.indexOf(value) === index;
  });
  
  // Find unique list of times
  var timeList = talks.map((t) => {
    return t.StartTime;
  }).filter((value, index, self) => { 
    return self.indexOf(value) === index;
  });
  
  var rooms = roomList.map((r) => {
    var talksInRoom = talks.filter((t) => {
      return t.Room === r;
    });
    timeList.map((time) => {
      talksInRoom.filter((t) => {
        return t.StartTime === time;
      })
    })
    talksInRoom[0].numOfPresenters = talksInRoom.length;
    talksInRoom[0].Presenters = buildPresenterList(talksInRoom);
    return talksInRoom[0];
  });
  return rooms;
}

function buildSpeakers(talks) {
  var speakers = [];
  
  // Find unique list of speakers
  var speakerList = talks.map((t) => {
    return t.FullName;
  }).filter((value, index, self) => { 
    return self.indexOf(value) === index;
  });
  
  var speakers = speakerList.map((s) => {
    var talksBySpeaker = talks.filter((t) => {
      return t.FullName === s;
    });
    return talksBySpeaker[0];
  });
  return speakers;
}