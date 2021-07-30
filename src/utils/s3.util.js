const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
});



exports.uploadBase64ImageFile = async(options) => {
    const { file, filename, mimeType} = options;

    const buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),'base64')

	const bucketData = {
		Bucket: 'hwcnbuckets',
		Key: filename,
		Body: buf,
        ContentEncoding: 'base64',
        ContentType: mimeType
	}

    const a = await s3.upload(bucketData).promise();
    const resp = {
        url: a.Location,
        // data: a
    }

    return resp;

}
