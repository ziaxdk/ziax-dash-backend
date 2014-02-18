var fs = require("fs"),
    request = require('request'),
    bulk = require('./bulk.js'),
    // bulkstream = require('./bulk-stream.js'),
    nullstream = require('./null-stream.js'),
    csv = require("csv-streamify"),
    elasticsearch = require('elasticsearch'),
    client = new elasticsearch.Client({ host: 'http://localhost:9200', log: 'error' });


// client.indices.create({
//   index: 'aviation',
//   body: {
//     "index" : {
//         "number_of_replicas": 0,
//         "number_of_shards": 1
//     },
//     "mappings" : {
//       "airport" : {
//         "properties" : {
//             "name": { "type": "string"},
//             "ident": { "type": "string"},
//             "iata": { "type": "string"},
//             "location" : { "type" : "geo_point" }
//         }
//       }
//     }
//   }
// }, function (err, resp) {
//   console.log(arguments);
//   client.close();
// });

// return;


function dobulk(data, done) {
  console.log('dobulk', data.length);
  var bulk = [];

  data.forEach(function(b) {
    var j = JSON.parse(b);
    bulk.push({ index:  { _index: 'aviation', _type: 'airport', _id: parseInt(j.id) } });
    bulk.push({
      name: j.name,
      ident: j.ident,
      iata: j.iata_code,
      location: [ parseFloat(j.longitude_deg), parseFloat(j.latitude_deg)]
    });
  });

  // client.ping({
  //   // ping usually has a 100ms timeout
  //   requestTimeout: 1000,

  //   // undocumented params are appended to the query string
  //   hello: "elasticsearch!"
  // }, function (error) {
  //   if (error) {
  //     console.trace('elasticsearch cluster is down!');
  //   } else {
  //     console.log('All is well');
  //   }
  //   done();
  // });

  client.bulk({
    body: bulk
  }, function(err, response, status) {
    if (err) throw err;
    done();
  });
}


var time = process.hrtime();

var b = bulk({ size: 40000 }, dobulk);
b.on('end', function() {
  client.close();
  var diff = process.hrtime(time);
  console.log('benchmark took %d nanoseconds', diff[0] * 1e9 + diff[1]);
  console.log('benchmark took %d seconds', diff[0]);
});

// request('http://www.ourairports.com/data/airports.csv')
fs.createReadStream("airports.csv")
  .pipe(csv({objectMode: false, columns: true}))
  .pipe(b)
  .pipe(nullstream())
  ;
