# :construction: juttle-mongodb-adapter [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> [Juttle][juttle] adapter to read from and write to MongoDB.

## Background

This was one of my projects during MongoDB Skunkworks in February, 2017. It is merely a proof of concept and there are many, many things to do before it would be ready for any real use.

Interested in hacking on this more? Check out the [juttle-elastic-adapter][juttle-elastic-adapter] for guidance on how to build things out further.

## Usage

Installation

```bash
npm install -g juttle-engine juttle-mongodb-adapter;
```

Add the `mongodb` adapter to `~/.juttle/config.json`:

```json
{
  "adapters": {
    "mongodb": {
      "url": "mongodb://localhost:27017/test"
    }
  }
}
```

Now when you start-up [juttle-engine][juttle-engine], you'll be able to use mongodb collections.

### `write mongodb`

Read a remote csv file and insert it into the `vega.airports` collection:

```
read http -url 'https://vega.github.io/vega-datasets/data/airports.csv' -format 'csv'
| write mongodb -ns 'vega.airports'
```

### `read mongodb`

Read documents from the `vega.airports` collection and show results in a data table:

```
read mongodb -ns 'vega.airports'
| view table
```

## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/juttle-mongodb-adapter.svg
[travis_url]: https://travis-ci.org/mongodb-js/juttle-mongodb-adapter
[npm_img]: https://img.shields.io/npm/v/juttle-mongodb-adapter.svg
[npm_url]: https://npmjs.org/package/juttle-mongodb-adapter
[juttle]: http://juttle.github.io/
[juttle-engine]: https://github.com/juttle/juttle-engine
[juttle-elastic-adapter]: https://github.com/juttle/juttle-elastic-adapter
