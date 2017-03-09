function MongoDBAdapter(config, Juttle) {
  console.log('MongoDBAdapter init', config, Juttle);

  return {
    name: 'mongodb',
    read: require('./read'),
    write: require('./write')
    // optimizer: require('./optimize')
  };
}

module.exports = MongoDBAdapter;
