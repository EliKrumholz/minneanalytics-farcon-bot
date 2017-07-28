module.exports = function(req, res, talks) {
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
    console.log(filteredTalks);
    if (filteredTalks.length === 0) {
      reply = {
        'speech': `Hmm, I didn't find any talks during session ${parameters.number}, double check the session number.`,
        'displayText': `Hmm, I didn't find any talks during session ${parameters.number}, double check the session number.`
      };
    } else if (filteredTalks.length === 1) {
      reply = {
        'speech': `In room *${filteredTalks[0].Room}*, ${filteredTalks[0].FullName} is presenting: "_${filteredTalks[0].Title}_"`,
        'displayText': `In room *${filteredTalks[0].Room}*, ${filteredTalks[0].FullName} is presenting: "_${filteredTalks[0].Title}_"`
      };
    } else if (filteredTalks.length > 1) {
      var presenters = filteredTalks.reduce((message, presenter, index, presenterArray) => {
        if (index === 0) {
          return `${presenter.FullName}`;
        } else if (index === presenterArray.length-1) {
          return `${message} and ${presenter.FullName}`;
        } else {
          return `${message}, ${presenter.FullName}`;
        }
      }, '');
      reply = {
        'speech': `In room *${filteredTalks[0].Room}*, ${presenters} are presenting: "_${filteredTalks[0].Title}_"`,
        'displayText': `In room *${filteredTalks[0].Room}*, ${presenters} are presenting: "_${filteredTalks[0].Title}_"`
      };
    }
  } else if (action === 'speaker.time') {
    var filteredTalks = talks.filter((t) => {return t.FullName.trim().toLowerCase().includes(parameters.FARCON2017_Speakers.trim().toLowerCase())});
    console.log(filteredTalks);
    if (filteredTalks.length === 1) {
      reply = {
        'speech': `*${filteredTalks[0].FullName}* is presenting from *${filteredTalks[0].StartTime}* until *${filteredTalks[0].EndTime}* in "*${filteredTalks[0].Room}*"`,
        'displayText': `*${filteredTalks[0].FullName}* is presenting from *${filteredTalks[0].StartTime}* until *${filteredTalks[0].EndTime}* in "*${filteredTalks[0].Room}*"`
      };
    } else {
      reply = {
        'speech': `Uh oh, try again.`,
        'displayText': `Uh oh, try again.`
      };
    }
  }
  
  res.status(200).json(reply);
};