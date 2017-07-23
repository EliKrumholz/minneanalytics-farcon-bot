module.exports = function(controller) {
    // Dashbot is a turnkey analytics platform for bots.
    // Sign up for a free key here: https://www.dashbot.io/ to see your bot analytics in real time.
    if (process.env.pgURI) {
      const { Pool, Client } = require('pg')
      
      var client = Client({
        connectionString: process.env.pgURI
      })
      client.connect()
        .then(()=>{
          controller.pg_client = client;
          console.log('Connected to PG DB');
        })
        .catch((error) => {
          console.log('Error connecting to PG DB', error);
        });
    } else {
      controller.log.info('No process.env.pgURI specified.');
    }
}
