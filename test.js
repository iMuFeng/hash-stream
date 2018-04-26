const fs = require('fs')
const streamHash = require('./index')

const readStream = fs.createReadStream('./README.md')

streamHash(readStream).then(shasum => {
  console.log(shasum)
}).catch(err => {
  console.error(err)
})
