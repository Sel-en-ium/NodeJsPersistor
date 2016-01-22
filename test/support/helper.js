/*jslint node: true*/
/*globals global, beforeEach, afterEach*/

module.exports = (function () {
  'use strict';

  var
    sinonOriginal = require('sinon');

  beforeEach(function () {
    global.sinon = sinonOriginal.sandbox.create();
  });

  afterEach(function () {
    global.sinon.restore();
  });

}());