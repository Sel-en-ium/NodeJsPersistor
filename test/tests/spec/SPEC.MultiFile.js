/*jslint node: true*/
/*globals describe, it, before, beforeEach, after, afterEach, vars, path, fse*/

(function () {
  'use strict';

  require('../../support/helper');

  var
    should = require('should'),
    Persistor = require('../../../adapters/MultiFile.js');

  describe("SPEC.MultiFile", function () {

    var
      path = require('path'),
      fse = require('graceful-fs-extra'),
      filesDir = path.resolve('someTempDir'),
      NOT_FOUND_CODE = 404,
      id,
      item = {param: 'blah'},
      myError = {blah: 'MahSpecialError!'},
      resourceContents,
      persistor;

    beforeEach(function () {
      persistor = new Persistor({dir: filesDir});
      resourceContents = undefined;
    });

    after(function (done) {
      fse.remove(filesDir, function (err) {
        should.not.exist(err);
        done();
      });
    });

    describe('Instantiation', function () {
      it('should throw an error if no dir specified', function () {
        try {
          persistor = new Persistor({});
          should.not.exist('should not get here, should have thrown an error');
        } catch (e) {
          e.message.should.match(/dir/);
        }
      });
      it('should instantiate successfully with all options specified', function () {
        try {
          persistor = new Persistor({dir: 'blah'});
          should.exist(persistor);
        } catch (e) {
          should.not.exist(e.message);
        }
      });
    });

    describe("#create(item, callback)", function () {
      describe('writeJson Error', function () {
        beforeEach(function () {
          sinon.stub(fse, 'writeJson', function (location, data, callback) {
            callback(myError);
          });
        });
        it('should call the callback with the error', function (done) {
          persistor.create(item, function (err) {
            JSON.stringify(err).should.equal(JSON.stringify(myError));
            done();
          });
        });
      });
      describe('readdir Error', function () {
        beforeEach(function () {
          sinon.stub(fse, 'readdir', function (dir, callback) {
            callback(myError);
          });
          sinon.stub(fse, 'writeJson', function (location, data, callback) {
            throw new Error('should not get here');
          });
        });
        it('should call the callback with the error', function (done) {
          persistor.create(item, function (err, recordId) {
            JSON.stringify(err).should.equal(JSON.stringify(myError));
            should.not.exist(recordId);
            done();
          });
        });
      });
      describe('directory does not exist', function () {
        beforeEach(function () {
          sinon.stub(fse, 'readdir', function (dir, callback) {
            callback({code: 'ENOENT'});
          });
        });
        describe('mkdirs success', function () {
          var
            called = false;
          beforeEach(function () {
            sinon.stub(fse, 'mkdirs', function (dir, callback) {
              called = true;
              callback();
            });
          });
          it('should call mkdirs', function (done) {
            persistor.create(item, function (err, recordId) {
              called.should.equal(true);
              should.not.exist(err);
              should.exist(recordId);
              done();
            });
          });
        });
        describe('mkdirs error', function () {
          beforeEach(function () {
            sinon.stub(fse, 'mkdirs', function (dir, callback) {
              callback(myError);
            });
          });
          it('should return the error', function (done) {
            persistor.create(item, function (err, recordId) {
              JSON.stringify(err).should.equal(JSON.stringify(myError));
              should.not.exist(recordId);
              done();
            });
          });
        });
      });
      //describe("Resource does not exist/is empty", function () {
      //  beforeEach(function () {
      //    sinon.stub(persistor, 'readJson', function (callback) {
      //      callback(null, resourceContents || []);
      //    });
      //    sinon.stub(persistor, 'writeJson', function (data, callback) {
      //      resourceContents = data;
      //      callback();
      //    });
      //  });
      //  it('should call the callback with the new id', function (done) {
      //    persistor.create(item, function (err, recordId) {
      //      should.not.exist(err);
      //      should.exist(recordId);
      //      done();
      //    });
      //  });
      //  it('should add the record to the resource', function (done) {
      //    persistor.create(item, function (err, recordId) {
      //      should.not.exist(err);
      //      should.exist(recordId);
      //      persistor.get(recordId, function (err, record) {
      //        should.not.exist(err);
      //        record.id.should.equal(recordId);
      //        record.param.should.equal(item.param);
      //        done();
      //      });
      //    });
      //  });
      //});
      //describe("resource exists and has content", function () {
      //  beforeEach(function (done) {
      //    sinon.stub(persistor, 'readJson', function (callback) {
      //      callback(null, resourceContents || []);
      //    });
      //    sinon.stub(persistor, 'writeJson', function (data, callback) {
      //      resourceContents = data;
      //      callback();
      //    });
      //    persistor.create(item, function (err, recordId) {
      //      should.not.exist(err);
      //      should.exist(recordId);
      //      id = recordId;
      //      done();
      //    });
      //  });
      //  it('should append new record to the resource with unique id', function (done) {
      //    var
      //      item2 = {param: 'blah2'};
      //
      //    // Call create
      //    persistor.create(item2, function (err, recordId) {
      //      should.not.exist(err);
      //      should.exist(recordId);
      //
      //      // Check that the first entry is still good
      //      persistor.get(id, function (err, record) {
      //        should.not.exist(err);
      //        record.id.should.equal(id);
      //        record.param.should.equal(item.param);
      //
      //        // Check new entry
      //        persistor.get(recordId, function (err, record) {
      //          should.not.exist(err);
      //          record.id.should.equal(recordId);
      //          record.param.should.equal(item2.param);
      //          done();
      //        });
      //      });
      //    });
      //  });
      //});

    });

    //describe('#get(id, callback)', function () {
    //
    //  describe('readJson Error', function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(myError);
    //      });
    //    });
    //    it('should call the callback with the error', function (done) {
    //      persistor.get(item, function (err, record) {
    //        JSON.stringify(err).should.equal(JSON.stringify(myError));
    //        should.not.exist(record);
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource does not exist/is empty", function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, {});
    //      });
    //    });
    //    it('should return an error', function (done) {
    //      persistor.get(12, function (err, record) {
    //        should.exist(err);
    //        err.status.should.equal(NOT_FOUND_CODE);
    //        should.not.exist(record);
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource exists and has content", function () {
    //    var
    //      id1,
    //      id2,
    //      id3,
    //      item1 = {param: 'blah1'},
    //      item2 = {param: 'blah2'},
    //      item3 = {param: 'blah3'};
    //    beforeEach(function (done) {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        resourceContents = data;
    //        callback();
    //      });
    //      persistor.create(item1, function (err, recordId) {
    //        should.not.exist(err);
    //        should.exist(recordId);
    //        id1 = recordId;
    //        persistor.create(item2, function (err, recordId) {
    //          should.not.exist(err);
    //          should.exist(recordId);
    //          id2 = recordId;
    //          persistor.create(item3, function (err, recordId) {
    //            should.not.exist(err);
    //            should.exist(recordId);
    //            id3 = recordId;
    //            done();
    //          });
    //        });
    //      });
    //    });
    //    it('should return an error when looking for invalid id', function (done) {
    //      persistor.get(id1 + id2 + id3, function (err, record) {
    //        should.exist(err);
    //        err.status.should.equal(NOT_FOUND_CODE);
    //        should.not.exist(record);
    //        done();
    //      });
    //    });
    //    it('should return the first item', function (done) {
    //      persistor.get(id1, function (err, record) {
    //        should.not.exist(err);
    //        record.param.should.equal(item1.param);
    //        record.id.should.equal(id1);
    //        done();
    //      });
    //    });
    //    it('should return the second item', function (done) {
    //      persistor.get(id2, function (err, record) {
    //        should.not.exist(err);
    //        record.param.should.equal(item2.param);
    //        record.id.should.equal(id2);
    //        done();
    //      });
    //    });
    //    it('should return the third item', function (done) {
    //      persistor.get(id3, function (err, record) {
    //        should.not.exist(err);
    //        record.param.should.equal(item3.param);
    //        record.id.should.equal(id3);
    //        done();
    //      });
    //    });
    //    it('should return the second item when passed a string for id as well', function (done) {
    //      persistor.get(JSON.stringify(id2), function (err, record) {
    //        should.not.exist(err);
    //        record.param.should.equal(item2.param);
    //        record.id.should.equal(id2);
    //        done();
    //      });
    //    });
    //  });
    //
    //});
    //
    //describe('#getAll(id, callback)', function () {
    //  describe('readJson Error', function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(myError);
    //      });
    //    });
    //    it('should call the callback with the error', function (done) {
    //      persistor.getAll(function (err, records) {
    //        JSON.stringify(err).should.equal(JSON.stringify(myError));
    //        should.not.exist(records);
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource does not exist/is empty", function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //    });
    //    it('should return an empty array', function (done) {
    //      persistor.getAll(function (err, records) {
    //        should.not.exist(err);
    //        Object.prototype.toString.call(records).should.equal('[object Array]');
    //        records.length.should.equal(0);
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource exists and has content", function () {
    //    var
    //      id1,
    //      id2,
    //      id3,
    //      item1 = {param: 'blah1'},
    //      item2 = {param: 'blah2'},
    //      item3 = {param: 'blah3'};
    //    beforeEach(function (done) {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        resourceContents = data;
    //        callback();
    //      });
    //      persistor.create(item1, function (err, recordId) {
    //        should.not.exist(err);
    //        should.exist(recordId);
    //        id1 = recordId;
    //        persistor.create(item2, function (err, recordId) {
    //          should.not.exist(err);
    //          should.exist(recordId);
    //          id2 = recordId;
    //          persistor.create(item3, function (err, recordId) {
    //            should.not.exist(err);
    //            should.exist(recordId);
    //            id3 = recordId;
    //            done();
    //          });
    //        });
    //      });
    //    });
    //    it('should return all the records', function (done) {
    //      persistor.getAll(function (err, records) {
    //        should.not.exist(err);
    //        Object.prototype.toString.call(records).should.equal('[object Array]');
    //        records.length.should.equal(3);
    //        records[0].param.should.equal(item1.param);
    //        records[0].id.should.equal(id1);
    //        records[1].param.should.equal(item2.param);
    //        records[1].id.should.equal(id2);
    //        records[2].param.should.equal(item3.param);
    //        records[2].id.should.equal(id3);
    //        done();
    //      });
    //    });
    //  });
    //});
    //
    //describe('#update(id, record, callback)', function () {
    //  var myId = 123;
    //  describe('readJson Error', function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(myError);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        throw new Error('should not get here');
    //      });
    //    });
    //    it('should call the callback with the error', function (done) {
    //      persistor.update({id: 1}, function (err, recordId) {
    //        JSON.stringify(err).should.equal(JSON.stringify(myError));
    //        should.not.exist(recordId);
    //        done();
    //      });
    //    });
    //  });
    //  describe('writeJson Error', function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        resourceContents = [{id: myId}];
    //        callback(null, resourceContents);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        callback(myError);
    //      });
    //    });
    //    it('should call the callback with the error', function (done) {
    //      persistor.update({id: myId}, function (err, recordId) {
    //        JSON.stringify(err).should.equal(JSON.stringify(myError));
    //        should.not.exist(recordId);
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource does not exist/is empty", function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        resourceContents = data;
    //        callback();
    //      });
    //    });
    //    it('should return an error', function (done) {
    //      persistor.update({id: myId}, function (err) {
    //        should.exist(err);
    //        err.status.should.equal(NOT_FOUND_CODE);
    //        done();
    //      });
    //    });
    //    it('should not add the entry', function (done) {
    //      persistor.update({id: myId}, function (err) {
    //        should.exist(err);
    //        err.status.should.equal(NOT_FOUND_CODE);
    //        persistor.get(myId, function (err, record) {
    //          should.exist(err);
    //          should.not.exist(record);
    //          done();
    //        });
    //      });
    //    });
    //  });
    //  describe("resource exists and has content", function () {
    //    var
    //      id1,
    //      id2,
    //      id3,
    //      item1 = {param: 'blah1'},
    //      item2 = {param: 'blah2'},
    //      item3 = {param: 'blah3'},
    //      updatedItem = {param: 'newBlah'};
    //    beforeEach(function (done) {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        resourceContents = data;
    //        callback();
    //      });
    //      persistor.create(item1, function (err, recordId) {
    //        should.not.exist(err);
    //        should.exist(recordId);
    //        id1 = recordId;
    //        persistor.create(item2, function (err, recordId) {
    //          should.not.exist(err);
    //          should.exist(recordId);
    //          id2 = recordId;
    //          persistor.create(item3, function (err, recordId) {
    //            should.not.exist(err);
    //            should.exist(recordId);
    //            id3 = recordId;
    //            done();
    //          });
    //        });
    //      });
    //    });
    //    it('should update only the first record', function (done) {
    //      updatedItem.id = id1;
    //      persistor.update(updatedItem, function (err) {
    //        should.not.exist(err);
    //        persistor.getAll(function (err, records) {
    //          should.not.exist(err);
    //          Object.prototype.toString.call(records).should.equal('[object Array]');
    //          records.length.should.equal(3);
    //          records[0].param.should.equal(updatedItem.param);
    //          records[0].id.should.equal(id1);
    //          records[1].param.should.equal(item2.param);
    //          records[1].id.should.equal(id2);
    //          records[2].param.should.equal(item3.param);
    //          records[2].id.should.equal(id3);
    //          done();
    //        });
    //      });
    //    });
    //    it('should update only the second record', function (done) {
    //      updatedItem.id = id2;
    //      persistor.update(updatedItem, function (err) {
    //        should.not.exist(err);
    //        persistor.getAll(function (err, records) {
    //          should.not.exist(err);
    //          Object.prototype.toString.call(records).should.equal('[object Array]');
    //          records.length.should.equal(3);
    //          records[0].param.should.equal(item1.param);
    //          records[0].id.should.equal(id1);
    //          records[1].param.should.equal(updatedItem.param);
    //          records[1].id.should.equal(id2);
    //          records[2].param.should.equal(item3.param);
    //          records[2].id.should.equal(id3);
    //          done();
    //        });
    //      });
    //    });
    //    it('should update only the third record', function (done) {
    //      updatedItem.id = id3;
    //      persistor.update(updatedItem, function (err) {
    //        should.not.exist(err);
    //        persistor.getAll(function (err, records) {
    //          should.not.exist(err);
    //          Object.prototype.toString.call(records).should.equal('[object Array]');
    //          records.length.should.equal(3);
    //          records[0].param.should.equal(item1.param);
    //          records[0].id.should.equal(id1);
    //          records[1].param.should.equal(item2.param);
    //          records[1].id.should.equal(id2);
    //          records[2].param.should.equal(updatedItem.param);
    //          records[2].id.should.equal(id3);
    //          done();
    //        });
    //      });
    //    });
    //  });
    //});
    //
    //describe('#remove(id, callback)', function () {
    //  var myId = 123;
    //  describe('readJson Error', function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(myError);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        throw new Error('should not get here');
    //      });
    //    });
    //    it('should call the callback with the error', function (done) {
    //      persistor.remove(myId, function (err) {
    //        JSON.stringify(err).should.equal(JSON.stringify(myError));
    //        done();
    //      });
    //    });
    //  });
    //  describe('writeJson Error', function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        resourceContents = [{id: myId}];
    //        callback(null, resourceContents);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        callback(myError);
    //      });
    //    });
    //    it('should call the callback with the error', function (done) {
    //      persistor.remove(myId, function (err) {
    //        JSON.stringify(err).should.equal(JSON.stringify(myError));
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource does not exist/is empty", function () {
    //    beforeEach(function () {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        resourceContents = data;
    //        callback();
    //      });
    //    });
    //    it('should return an error', function (done) {
    //      persistor.remove(myId, function (err) {
    //        should.exist(err);
    //        err.status.should.equal(NOT_FOUND_CODE);
    //        done();
    //      });
    //    });
    //  });
    //  describe("resource exists and has content", function () {
    //    var
    //      id1,
    //      id2,
    //      id3,
    //      item1 = {param: 'blah1'},
    //      item2 = {param: 'blah2'},
    //      item3 = {param: 'blah3'};
    //    beforeEach(function (done) {
    //      sinon.stub(persistor, 'readJson', function (callback) {
    //        callback(null, resourceContents || []);
    //      });
    //      sinon.stub(persistor, 'writeJson', function (data, callback) {
    //        resourceContents = data;
    //        callback();
    //      });
    //      persistor.create(item1, function (err, recordId) {
    //        should.not.exist(err);
    //        should.exist(recordId);
    //        id1 = recordId;
    //        persistor.create(item2, function (err, recordId) {
    //          should.not.exist(err);
    //          should.exist(recordId);
    //          id2 = recordId;
    //          persistor.create(item3, function (err, recordId) {
    //            should.not.exist(err);
    //            should.exist(recordId);
    //            id3 = recordId;
    //            done();
    //          });
    //        });
    //      });
    //    });
    //    it('should remove only the first record', function (done) {
    //      persistor.remove(id1, function (err) {
    //        should.not.exist(err);
    //        persistor.getAll(function (err, records) {
    //          should.not.exist(err);
    //          Object.prototype.toString.call(records).should.equal('[object Array]');
    //          records.length.should.equal(2);
    //          records[0].param.should.equal(item2.param);
    //          records[0].id.should.equal(id2);
    //          records[1].param.should.equal(item3.param);
    //          records[1].id.should.equal(id3);
    //          done();
    //        });
    //      });
    //    });
    //    it('should remove only the second record', function (done) {
    //      persistor.remove(id2, function (err) {
    //        should.not.exist(err);
    //        persistor.getAll(function (err, records) {
    //          should.not.exist(err);
    //          Object.prototype.toString.call(records).should.equal('[object Array]');
    //          records.length.should.equal(2);
    //          records[0].param.should.equal(item1.param);
    //          records[0].id.should.equal(id1);
    //          records[1].param.should.equal(item3.param);
    //          records[1].id.should.equal(id3);
    //          done();
    //        });
    //      });
    //    });
    //    it('should remove only the third record', function (done) {
    //      persistor.remove(id3, function (err) {
    //        should.not.exist(err);
    //        persistor.getAll(function (err, records) {
    //          should.not.exist(err);
    //          Object.prototype.toString.call(records).should.equal('[object Array]');
    //          records.length.should.equal(2);
    //          records[0].param.should.equal(item1.param);
    //          records[0].id.should.equal(id1);
    //          records[1].param.should.equal(item2.param);
    //          records[1].id.should.equal(id2);
    //          done();
    //        });
    //      });
    //    });
    //  });
    //});

  });

}());