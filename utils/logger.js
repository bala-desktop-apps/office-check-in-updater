const log = require('electron-log');
const path = require("path");

class Logger {
	constructor() {
		log.transports.file.resolvePath = (variables) => {
			console.log(variables);
			return path.join(__dirname, '../main.log');
		}
	}
	info(...args) {
		console.info(args);
		log.info(args);
	}
	warn(...args) {
		console.warn(args);
		log.warn(args);
	}
	error(...args) {
		console.error(args);
		log.error(args);
	}
}
module.exports = new Logger();