const AWS = require('aws-sdk');


const uploadToS3 = (data, filename) => {
    const BUCKET_NAME = 'expenseapp1234';
    const IAM_USER_KEY = 'AKIA2RLQGZSMUYSOWWCR';
    const IAM_USER_SECRET = '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';
    
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if(err) {
                console.log('Something went wrong', err)
                reject(err)
            }else {
                //console.log('Success', s3response);
                resolve(s3response.Location);
            }
        })
    })
    
}

module.exports = {
    uploadToS3
}