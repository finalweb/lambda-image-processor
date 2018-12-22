const getFile = require('./s3-functions.js').getFile;
const uploadFile = require('./s3-functions.js').uploadFile;
const gm = require('gm').subClass({imageMagick: true});

exports.resizeImage = async function (args) {
  args = Object.assign({}, args);
  let ext = args.file_extension || args.key.split('.').pop();
  if (typeof args.destination_key === 'undefined') {
    let fileFolder = args.key.split('/original/').shift();
    let fileName = args.width || args.size;
    args.destination_key = fileFolder + '/_thumbnails/' + fileName + '.' + ext;
  }

  console.log('EXT: ', ext, ' DESTINATION KEY: ', args.destination_key);

  return getFile(args.source_bucket, args.key, 'tempfile').then((contentType) => {
    contentType = args.contentType || contentType;

    return new Promise((resolve, reject) => {

      let width = args.width || args.size;
      let height = args.width || args.size;

      gm('/tmp/tempfile')
        .resize(width, height)
        .write('/tmp/' + width, (err) => {
          console.log('ARGS: ', args);
          if (!err) console.log('Resize Complete');
          uploadFile(args.destination_bucket, args.destination_key, width, contentType).then(() => {
            console.log('Upload Complete');
            resolve();
          });
        });
    });
  });
};
