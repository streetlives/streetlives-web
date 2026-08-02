/* eslint-disable global-require, import/no-commonjs */
const {
  attachStreetliDevAuthMiddleware,
} = require('../devServer/streetliDevAuthMiddleware');

module.exports = function setupProxy(app) {
  attachStreetliDevAuthMiddleware(app);
};
