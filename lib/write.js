/* global JuttleAdapterAPI */
const AdapterWrite = JuttleAdapterAPI.AdapterWrite;
const values = JuttleAdapterAPI.runtime.values;
// const logger = JuttleAdapterAPI.getLogger('mongodb-write');
const debug = require('debug')('juttle-mongodb-adapter:write');
const mongodb = require('mongodb');
const pify = require('pify');
const connect = pify(mongodb.connect);
const parseNS = require('mongodb-ns');

const _ = require('lodash');

function fromJuttle(doc) {
  return _.transform(doc, function(result, value, key) {
    if (values.isDate(value) || values.isDuration(value)) {
      result[key] = new Date(value.valueOf());
    } else if (_.isObject(value)) {
      result[key] = fromJuttle(value);
    } else {
      result[key] = value;
    }
  }, {});
}

class WriteMongoDB extends AdapterWrite {
  constructor(options, params) {
    super(options, params);
    debug('constructor', options, params);
    this.ns = options.ns || 'test.juttle';

    const ns = parseNS(this.ns);
    this.database_name = ns.database;
    this.collection_name = ns.collection;

    this.eof_received = false;
  }

  static allowedOptions() {
    return [ 'ns'];
  }

  db() {
    if (this._db) {
      debug('Already connected');
      return Promise.resolve(this._db);
    }
    debug('connecting...');
    return connect('mongodb://localhost:27017/test', {}).then((db) => {
      this._db = db;
      debug('connected!');
      return this._db;
    });
  }

  write(points) {
    return this.db().then((db) => {
      const coll = db.db(this.database_name).collection(this.collection_name);
      const writer = coll.initializeOrderedBulkOp();
      _.each(points, (point) => {
        writer.insert(fromJuttle(point));
      });

      return new Promise((resolve, reject) => {
        writer.execute((err, res) => {
          debug('bulk write returned', err, res);
          this.eof_received = true;
          if (err) return reject(err);
          resolve(res);
        });
      });
    });
  }

  eof() {
    return this.eof_received;
  }
}

module.exports = WriteMongoDB;
