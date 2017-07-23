module.exports = function(controller) {
  controller.hears(['support.about'],'direct_message', controller.apiai.action, function(bot, message) {
    bot.reply(message, 'We assemble widgets with dohinkies to create state of the art reverse encabulators');
  });
  
  controller.hears(['talk.time'],'direct_message', controller.apiai.action, function(bot, message) {
    console.log(message);
    bot.reply(message, `Let me check what talks are happening at ${message.entities.time}${message.entities['time-period']}...`);
  })
}