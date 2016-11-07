var core = require('./core');
var utils = require('./test/utils');

module.exports = {
    Deserialize: core.deserialize,
    serialize: core.serialize,
    utils: utils
}