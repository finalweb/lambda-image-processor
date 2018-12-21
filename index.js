const getFile = require('./src/s3-functions.js').getFile;
const resizeImage = require('./src/image-functions.js').resizeImage;

exports.handler = async (event) => {
  let data = JSON.parse(event.Records[0].body);
  let {operation, ...args} = data;

  // use the source as destination if destination not specified
  args.destination_bucket = args.destination_bucket || args.source_bucket;
  let ext;
  switch (operation) {
    case 'resize':
      return resizeImage(args);

    case 'thumbnail':
      ext = args.key.split('.').pop();
      let fileFolder = args.key.split('/original/').shift();
      let destinationFolder = fileFolder + '/_thumbnails/';

      console.log('DESTINATION: ', destinationFolder);
      console.log('Sizes: ', args.sizes);

      return getFile(args.source_bucket, args.key, 'tempfile').then((contentType) => {
        let promises = [];
        args.sizes.forEach((size) => {
          console.log('Sizing to: ', size);
          args.size = size;
          args.contentType = contentType;
          args.destination_key = fileFolder + '/_thumbnails/' + args.size + '.' + ext;
          promises.push(resizeImage(args));
        });
        return Promise.all(promises);
      });
      break;
  }



};
