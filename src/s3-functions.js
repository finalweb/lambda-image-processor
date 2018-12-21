const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');

exports.getFile = function(bucket, key, filename) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync('/tmp/' + filename)) {
      console.log('FILE EXISTS');
      resolve();
    } else {
      s3.getObject({
        Bucket: bucket,
        Key: key
      }, (err, data) => {
        if (err) console.error(err)
        fs.writeFileSync('/tmp/' + filename, data.Body)
        resolve(data.ContentType);
        console.log(`${filename} has been created!`)
      });
    }
  });
};


exports.uploadFile = function(bucket, key, filename, contentType) {
  return new Promise((resolve, reject) => {
    console.log('About to read: ', filename);
    let buffer = fs.readFileSync('/tmp/' + filename);
    s3.upload({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: contentType
    }, (err, data) => {
      if (err) console.error(`Upload Error ${err}`)
      resolve()
      console.log('Upload Completed')
    })
  });
};
