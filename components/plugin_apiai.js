module.exports = function(controller) {

    // Dashbot is a turnkey analytics platform for bots.
    // Sign up for a free key here: https://www.dashbot.io/ to see your bot analytics in real time.
    if (process.env.apiaiToken) {
      var apiai = require('botkit-middleware-apiai')({
        token: process.env.apiaiToken,
        skip_bot: true
      });
      controller.apiai = apiai;
      controller.middleware.receive.use(apiai.receive);
      controller.log.info('Thanks for using API.AI.');
    } else {
      controller.log.info('No process.env.apiaiToken specified.');
    }

}

