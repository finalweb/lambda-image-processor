const getFile = require('./src/s3-functions.js').getFile;
const resizeImage = require('./src/image-functions.js').resizeImage;
const fs = require('fs');
const sqs = require('./src/queue-helper.js');

exports.handler = async (event) => {
  let data = JSON.parse(event.Records[0].body);
  let {operation, ...args} = data;

  if (fs.existsSync('/tmp/tempfile')) {
    fs.unlinkSync('/tmp/tempfile');
  }

  // use the source as destination if destination not specified
  args.destination_bucket = args.destination_bucket || args.source_bucket;
  args.contentType = args.file_mime_type;
  let ext;
  switch (operation) {
    case 'resize':
      return resizeImage(args).then(() => {
        if (args.callback_action) {
          return sqs.sendMessage(callbackAction, {
            success: true,
            originalRequest: data
          }, args.sqs_url);
        }
        return true;
      });

    case 'thumbnail':
      ext = args.file_extension || args.key.split('.').pop();
      let fileFolder = args.key.split('/original/').shift();
      let destinationFolder = fileFolder + '/_thumbnails/';

      console.log('DESTINATION: ', destinationFolder);
      console.log('Sizes: ', args.sizes);

      return getFile(args.source_bucket, args.key, 'tempfile').then((contentType) => {
        let promises = [];
        args.sizes.forEach((size) => {
          console.log('Sizing to: ', size);
          args.size = size;
          args.contentType = args.file_mime_type || contentType;
          args.destination_key = fileFolder + '/_thumbnails/' + args.size + '.' + ext;
          promises.push(resizeImage(args));
        });
        return Promise.all(promises).then(() => {
          if (args.callback_action) {
            return sqs.sendMessage(callbackAction, {
              success: true,
              originalRequest: data
            }, args.sqs_url);
          }
          return true;
        });
      });
      break;
  }



};
