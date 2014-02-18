var fs = require("fs"),
    bulk = require('./bulk.js'),
    csv = require("csv-streamify");

function dobulk(data) {
  console.log('DO BULK', data);
}


fs.createReadStream("airports2.csv")
  .pipe(csv({objectMode: false, columns: true}))
  .pipe(bulk({ size: 3 }, dobulk))
  .pipe(process.stdout)
  ;