
const logger = require('./logger');
const { platform } = require('process');
const { net } = require("electron");
const API_URL = 'https://rto-roster-api.g1.app.cloud.comcast.net';
//const API_URL = 'http://localhost:3001';

function sendRequest(url = null, options = {}, body = {}) {
  return new Promise(function (resolve, reject) {
    const request = net.request(url ? url : options);
    request.on('response', (response) => {
      logger.info(`STATUS: ${response.statusCode}`);
      response.on('data', (data) => {
        try {
          const responseJson = JSON.parse(data);
          resolve(responseJson);
        } catch(e) {
          logger.error(e);
          resolve({});
        }
      });
      response.on('error', (error) => {
        logger.error(`ERROR: ${JSON.stringify(error)}`);
        reject({
          "isAlreadyCheckIn": false,
          "inOfficeNetwork": false
        });
      });
    });
    request.on('error', (error) => {
      console.log(error);
      logger.error(`ERROR: ${JSON.stringify(error)}`);
      reject(error);
    });
    if (options.method === 'POST') {
      request.setHeader('Content-Type', 'application/json');
      request.write(body, 'utf-8');
    }
    request.end();
  }).catch((e) => {
    return {
      "isAlreadyCheckIn": false,
      "inOfficeNetwork": false
    };
  });
}
function checkAttendence(ntid, ssid) {
  logger.info('Checking attendence for', ntid, ssid, new Date().toISOString().split("T")[0]);
  return sendRequest(`${API_URL}/is-already-check-in?ntid=${ntid}&ssid=${ssid}&check_in_date=${new Date().toISOString().split("T")[0]}`);
}
function sendAttendence(ntid, ssid) {
  logger.info('Sending attendence for', ntid, ssid);
  const body = JSON.stringify({
    "ssid": ssid,
    "ntid": ntid,
    "platform": platform,
    "check_in_date": new Date().toISOString().split("T")[0]
  });
  const [protocol, host] = API_URL.split("//");
  const options = {
    method: 'POST',
    host: host,
    protocol: protocol,
    path: '/check-in-to-office'
  };
  return sendRequest(null, options, body);
}
module.exports = {
  checkAttendence: checkAttendence,
  sendAttendence: sendAttendence
};