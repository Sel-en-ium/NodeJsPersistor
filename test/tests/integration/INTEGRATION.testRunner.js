/*jslint node: true*/
/*globals describe, it, before, beforeEach, after, afterEach, vars, path, fse*/

(function () {
  'use strict';

  var
    should = require('should'),
    path = require('path'),
    testSuite = require('./INTEGRATION.tests'),
    Persistor = require(path.resolve("./interface.js")),
    testParam,
    testObjects,
    temp,
    config,
    i;

  describe("INTEGRATION", function () {
    try {
      config = require('../../support/config');
    } catch (e) {
      e.message += '\n!!!Please create the file "test/support/config.js" '
        + 'according to the instructions found in "test/support/configTemplate.js".!!!';
      throw e;
    }

    describe('LocalFile', function () {

      // Init persistor
      var
        fse = require('graceful-fs-extra'),
        fileDir = 'someTempDir',
        fileName = 'tempLocalFileForTest.json',
        filePath = path.resolve(path.join(fileDir, 'thatIsNested', fileName)),
        options = {
          type: 'LocalFile',
          config: {
            filePath: filePath
          }
        },
        persistor = new Persistor(options),
        refreshResourceFn;

      // Create removeResourceFn
      refreshResourceFn = function (done) {
        /*jslint stupid: true*/
        if (fse.existsSync(fileDir)) {
          fse.remove(fileDir, function (err) {
            should.not.exist(err);
            done();
          });
        } else {
          done();
        }
      };

      testParam = 'param';
      testObjects = [];
      for (i = 0; i < 4; i += 1) {
        temp = {};
        temp[testParam] = 'blah' + String(i);
        testObjects.push(temp);
      }

      testSuite(persistor, refreshResourceFn, refreshResourceFn, testObjects, testParam);
    });

    describe('MultiFile', function () {
      // Init persistor
      var
        fse = require('graceful-fs-extra'),
        fileDir = 'someTempDir',
        filePath = path.join(path.resolve(fileDir), 'thatIsNested'),
        options = {
          type: 'MultiFile',
          config: {
            dir: filePath
          }
        },
        persistor = new Persistor(options),
        refreshResourceFn;

      // Create removeResourceFn
      refreshResourceFn = function (done) {
        fse.remove(fileDir, function (err) {
          should.not.exist(err);
          done();
        });
      };

      testParam = 'param';
      testObjects = [];
      for (i = 0; i < 4; i += 1) {
        temp = {};
        temp[testParam] = 'blah' + String(i);
        testObjects.push(temp);
      }

      testSuite(persistor, refreshResourceFn, refreshResourceFn, testObjects, testParam);
    });

  });

}());