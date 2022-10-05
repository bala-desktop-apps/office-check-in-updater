
const { env } = require('process');

module.exports = function() {
    return (env.SUDO_USER || env.C9_USER ||
        env.LOGNAME || env.USER || env.LNAME || env.USERNAME);
}