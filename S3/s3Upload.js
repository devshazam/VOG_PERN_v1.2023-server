const S3 = require('aws-sdk/clients/s3')

const fs = require('fs')

const uploadParams = { Bucket: process.env.BACKET, Key: '', Body: '' } // <--- заменить

const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID, // <--- заменить
  secretAccessKey: process.env.SECRET_ACCESS_KEY, // <--- заменить
  endpoint: 'https://s3.timeweb.com',
  s3ForcePathStyle: true,
  region: 'ru-1',
  apiVersion: 'latest',
})


const fileUploadCustom = async (fileName) => {

    const stream = fs.createReadStream('static/' + fileName);

    uploadParams.Body = stream 
    uploadParams.Key = fileName
    const data = await s3.upload(uploadParams).promise()
    return data.Location;

}

module.exports = { fileUploadCustom };
