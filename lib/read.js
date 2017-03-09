/* global JuttleAdapterAPI */

const _ = require('lodash');
const mongodb = require('mongodb');
const pify = require('pify');
const connect = pify(mongodb.connect);
const parseNS = require('mongodb-ns');
const debug = require('debug')('juttle-mongodb-adapter');

var AdapterRead = JuttleAdapterAPI.AdapterRead;
var JuttleMoment = JuttleAdapterAPI.types.JuttleMoment;

function toJuttle(doc) {
  return _.transform(doc, function(result, value, key) {
    if (_.isNil(value)) return;
    if (_.isDate(value)) {
      result[key] = new JuttleMoment({
        rawDate: value
      });
      return;
    }
    if (_.isObject(value)) {
      result[key] = toJuttle(value);
      return;
    }
    result[key] = value;
  }, {});
}

class ReadMongoDB extends AdapterRead {
  constructor(options, params) {
    super(options, params);
    debug('constructor', options, params);
    this.fields = this.options.fields || null;
    this.ns = options.ns || 'local.startup_log';

    const ns = parseNS(this.ns);
    this.database_name = ns.database;
    this.collection_name = ns.collection;

    this.optimizations = params.optimization_info;
  }

  static allowedOptions() {
    return AdapterRead.commonOptions().concat([ 'fields', 'ns' ]);
  }

  periodicLiveRead() {
    return false;
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

  find(query, options) {
    debug('find', this.database_name, this.collection_name, query, options);
    return this.db().then((db) => {
      const coll = db.db(this.database_name).collection(this.collection_name);
      return new Promise((resolve, reject) => {
        coll.find(query, options).toArray((err, docs) => {
          if (err) return reject(err);
          resolve(docs);
        });
      });
    });
  }

  read(from, to, limit, state) {
    debug('read', from, to, limit, state);
    // var query = this.queryBuilder.compile(this.filter, {
    //   fields: this.fields,
    //   optimizations: this.optimizations
    // });

    var query = {
      // TODO convert AST to agg pipeline.
    };

    var options = {
      // fields: this.fields TODO
      limit: limit || 10
    };

    return this.find(query, options).then((docs) => {
      // NOTE (imlucas) Apparently can't have any nulls or else get this error:
      // Error: internal error Error: Invalid Juttle value: Fri May 29 2015 16:53:32 GMT-0400 (EDT). (INTERNAL-ERROR)
      const points = _.map(docs, toJuttle);

      debug('Sending points %j', points);

      return {
        points: points,
        // readEnd: to
        eof: true
      };
    });
  }

  // toNative(results) {
  //   var fields = results.fields;
  //   return _.map(results.rows, function(row) {
  //     var obj = _.object(fields, row);
  //     if (obj._time) {
  //       obj.time = JuttleMoment.parse(obj._time);
  //     }
  //     return obj;
  //   });
  // }
  //
  // search(query, options) {
  //   var self = this;
  //   return new Promise(function(resolve, reject) {
  //     return self.splunk.oneshotSearch(query, options, function(
  //       error,
  //       results
  //     ) {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(results);
  //       }
  //     });
  //   });
  // }
}

module.exports = ReadMongoDB;
