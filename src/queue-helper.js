const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

exports.sendMessage = (jobName, json, sqsUrl) => {
  return new Promise((resolve, reject) => {
    var params = {
      MessageBody: JSON.stringify({
        job: jobName,
        data: JSON.stringify(json)
      }),
      QueueUrl: sqsUrl || process.env.SQS_URL
    };
    console.log('SQS PARAMS: ', params);
    sqs.sendMessage(params, function(err, data) {
      if (err) {
        console.log('THERE WAS AN ERROR!');
        console.log(err, err.stack); // an error occurred
        reject();
      } else {
        console.log(data);           // successful response
        console.log('---->Successfully sent message');
        resolve();
      }
    });
  });
}
