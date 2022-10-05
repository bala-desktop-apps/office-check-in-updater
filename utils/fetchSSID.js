const logger = require('./logger');
const wifi = require('node-wifi');

wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});

function fetchSSID() {
  return wifi.getCurrentConnections().then((currentConnections) => {
    logger.info('Connected to ', currentConnections[0]?.ssid);
    return currentConnections[0]?.ssid;
  }).catch(error => {
    logger.error('No wifi connection', error);
    // error
    return false;
  });
}
module.exports = fetchSSID;