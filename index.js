const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function randomString(len) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len)
}

function streamHash(input, options = {}) {
  return new Promise((resolve, reject) => {
    const algorithm = options.algorithm || 'sha1'
    const shasum = crypto.createHash(algorithm)

    let output = null
    let filePath = null
    let fileName = null
    let ext = null

    if (options.fileName) {
      ext = path.extname(options.fileName)
      fileName = randomString(48) + ext
      filePath = options.baseDir ? options.baseDir + '/' + fileName : fileName
      output = fs.createWriteStream(filePath)
    }

    input.on('data', chunk => {
      shasum.update(chunk)
      if (output) output.write(chunk)
    })

    input.on('end', () => {
      const shatext = shasum.digest('hex')

      if (output) {
        output.end()
        const newPath = filePath.replace(fileName, shatext + ext)

        fs.rename(fileName, newPath, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              shasum: shatext,
              fileName: shatext + ext,
              ext
            })
          }
        })
      } else {
        resolve(shatext)
      }
    })

    input.on('error', err => {
      reject(err)
    })
  })
}

module.exports = streamHash
