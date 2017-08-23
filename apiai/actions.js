var moment = require('moment');
var apiai = require('apiai');
var apiaiApp = apiai(process.env.APIAI_TOKEN);

module.exports = function(req, res, farconData) {
  var talks = farconData.talks;
  var rooms = farconData.rooms;
  var speakers = farconData.speakers;
  var uniqueTalks = farconData.uniqueTalks;
  
  var reply = {};
  var action = req.body.result.action;
  var parameters = req.body.result.parameters;
  
  if (action === 'stars.composition') {
    reply = {
      speech: "The stuff of dreams!",
      displayText: "The stuff of dreams!"
    };
  } else if (action === 'talk.session') {
    var filteredTalks = talks.filter((t) => {return t.Session === String(parameters.number)});
    if (filteredTalks.length === 0) {
      reply = {
        'speech': `Hmm, I didn't find any talks during session ${parameters.number}, double check the session number.`,
        'displayText': `Hmm, I didn't find any talks during session ${parameters.number}, double check the session number.`
      };
    } else if (filteredTalks.length === 1) {
      reply = {
        'speech': `In the "*${filteredTalks[0].Room}*", ${filteredTalks[0].FullName} is presenting: "_${filteredTalks[0].Title}_"`,
        'displayText': `In the "*${filteredTalks[0].Room}*", ${filteredTalks[0].FullName} is presenting: "_${filteredTalks[0].Title}_"`
      };
    } else if (filteredTalks.length > 1) {
      var presenters = buildPresenterList(filteredTalks);
      reply = {
        'speech': `In the "*${filteredTalks[0].Room}*", ${presenters} are presenting: "_${filteredTalks[0].Title}_"`,
        'displayText': `In the "*${filteredTalks[0].Room}*", ${presenters} are presenting: "_${filteredTalks[0].Title}_"`
      };
    }
  } else if (action === 'speaker.time') {
    var filteredTalks = talks.filter((t) => {return t.FullName.trim().toLowerCase().includes(parameters.FARCON2017_Speakers.trim().toLowerCase())});
    if (filteredTalks.length === 1) {
      var talkId = talks.indexOf(filteredTalks[0]);
      reply = {
        'speech': `*${filteredTalks[0].FullName}* is presenting _"${filteredTalks[0].Title}"_ at *${filteredTalks[0].StartTimeMoment.format("h:mm a")}* in the "*${filteredTalks[0].Room}*"\nWould you like to see the abstract?"`
      };
    } else if (filteredTalks.length > 1) {
      cancelContext(req);
      var talksString = filteredTalks.reduce((message, talk) => {
        return message + `*${talk.FullName}* is presenting _"${talk.Title}"_  at *${talk.StartTimeMoment.format("h:mm a")}* in the "*${talk.Room}*"\n`
      }, '');
      var presenters = buildPresenterList(filteredTalks);
      reply = {
        'speech': talksString
      };
    } else {
      cancelContext(req);
      reply = {
        'speech': `Sorry, I couldn't find that speaker, try double checking your spelling.`
      };
    }
  } else if (action === 'speaker.bio') {
    var filteredTalks = talks.filter((t) => {return t.FullName.trim().toLowerCase().includes(parameters.FARCON2017_Speakers.trim().toLowerCase())});
    console.log(filteredTalks);
    if (filteredTalks.length >= 1) {
      reply = {
        'speech': `*${filteredTalks[0].FullName}* is a *${filteredTalks[0].Position}* at *${filteredTalks[0].Organization}*: ${filteredTalks[0].LinkedIn}`,
        'displayText': `*${filteredTalks[0].FullName}* is a *${filteredTalks[0].Position}* at *${filteredTalks[0].Organization}*`
      };
    } else {
      reply = {
        'speech': `Sorry, I couldn't find that speaker, try double checking your spelling.`,
        'displayText': `Sorry, I couldn't find that speaker, try double checking your spelling.`
      };
    }
  } else if (action === 'speaker.abstract') {
    var context = req.body.result.contexts[0];
    console.log(context);
    var filteredTalks = talks.filter((t) => {return t.FullName.trim().toLowerCase().includes(context.parameters.FARCON2017_Speakers.trim().toLowerCase())});   
    if (filteredTalks.length === 1) {
      reply = {
        'speech': `*Here is the abstract:*\n${filteredTalks[0].Abstract}`
      };
    }
  } else if (action === 'talk.time') {
    var queryMoment = moment(`2017-08-24 ${parameters.time}`);
    if (queryMoment < moment('2017-08-24 07:00:00')) {
      queryMoment = queryMoment.add(12, 'hours');
    }
    var filteredTalks = uniqueTalks.filter((t) => {return t.StartTimeMoment <= queryMoment && queryMoment < t.EndTimeMoment});
    var talksString = filteredTalks.reduce((message, talk) => {
      return message + `In the "*${talk.Room}*", ${talk.Presenters} ${talk.numOfPresenters > 1 ? 'are' : 'is'} presenting: "_${talk.Title}_"\n`
    }, '');
    if (filteredTalks.length > 0) {
      reply = {
        'speech': `I found ${filteredTalks.length} ${filteredTalks.length === 1 ? 'talk' : 'talks'}:\n${talksString}`
      };
    } else {
      reply = {
        'speech': `Sorry, I didn't find any talks at ${queryMoment.format("h:mm a")}.`
      };
    }
  } else if (action === 'room.schedule' || action === 'room.speakers') {
    var filteredTalks = uniqueTalks.filter((t) => {return t.Room === parameters.FARCON2017_Rooms});
    var talksString = filteredTalks.reduce((message, talk) => {
      return message + `From *${talk.StartTimeMoment.format("h:mm a")}* to *${talk.EndTimeMoment.format("h:mm a")}*, in the *${talk.Room}*, ${talk.Presenters} ${talk.numOfPresenters === 1 ? 'is' : 'are'} presenting: "_${talk.Title}_"\n`
    }, '');
    if (filteredTalks.length > 0) {
      reply = {
        'speech': `I found ${filteredTalks.length} ${filteredTalks.length === 1 ? 'talk' : 'talks'} in the ${parameters.FARCON2017_Rooms}:\n${talksString}`
      }
    } else {
      reply = {
        'speech': `Sorry, I didn't find any talks in the ${parameters.FARCON2017_Rooms}`
      };
    }
  } else if (action === 'organization.speakers') {
    var filteredTalks = speakers.filter((t) => {return t.Organization === parameters.FARCON2017_SpeakerOrgs});
    var speakerString = filteredTalks.reduce((message, talk) => {
      return message + `*${filteredTalks[0].FullName}* is a *${filteredTalks[0].Position}*: ${filteredTalks[0].LinkedIn}"\n`
    }, '');
    reply = {
      'speech': `I found ${filteredTalks.length} ${filteredTalks.length === 1 ? 'speaker' : 'speakers'} from ${parameters.FARCON2017_SpeakerOrgs}:\n${speakerString}`
    };
  } else if (action === 'test.followup') {
    console.log('followup action');
    console.log(req.body);
    // cancelContext(req);
    
  } else if (action === 'test.followup.yes') {
    console.log('followup action - yes!');
    console.log(req.body);
    console.log(req.body.result.contexts);
    reply = {
      'speech': 'Here is your followup!'
    }
  }
  
  res.status(200).json(reply);
};

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

function cancelContext(req) {
  var options = {
    sessionId: req.body.sessionId
  };

  var request = apiaiApp.deleteContextsRequest(options);

  request.on('error', function(error) {
      console.log(error);
  });
  request.end();
}
