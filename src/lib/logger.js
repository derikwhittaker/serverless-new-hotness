

function trace(opCode, message) {
    console.log(`[TRACE] : [${opCode}] - ${message}`);
};

function debug(opCode, message) {
    console.log(`[DEBUG] : [${opCode}] - ${message}`);
};

function info(opCode, message) {
    console.log(`[INFO] : [${opCode}] - ${message}`);
};

function error(opCode, message) {
    console.log(`[ERROR] : [${opCode}] - ${message}`);
};

module.exports = {
    trace,
    debug,
    info,
    error
}