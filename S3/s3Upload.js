const S3 = require('aws-sdk/clients/s3')
const uuid = require("uuid");
const path = require("path");
const fs2 = require('fs')
const fs = require('fs').promises;

const uploadParams = { Bucket: process.env.BACKET, Key: '', Body: '' } // <--- заменить

const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID, // <--- заменить
  secretAccessKey: process.env.SECRET_ACCESS_KEY, // <--- заменить
  endpoint: 'https://s3.timeweb.com',
  s3ForcePathStyle: true,
  region: 'ru-1',
  apiVersion: 'latest',
})


const fileUploadCustom = async (img) => {

    const imgName = img.name;
    const fileName = uuid.v4() + '_' + imgName ;
    await img.mv(path.resolve(__dirname, "..", "static", fileName));

    const stream = fs2.createReadStream('static/' + fileName);

    uploadParams.Body = stream 
    uploadParams.Key = fileName
    const data = await s3.upload(uploadParams).promise()

    await fs.unlink("static/" + fileName);

    return data.Location;

}

module.exports = { fileUploadCustom };
