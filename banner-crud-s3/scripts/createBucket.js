const { S3Client, CreateBucketCommand, PutBucketPublicAccessBlockCommand, PutBucketPolicyCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function createBucket() {
    try {
        console.log(`Creating bucket: ${bucketName}...`);
        await client.send(new CreateBucketCommand({
            Bucket: bucketName,
            CreateBucketConfiguration: {
                LocationConstraint: process.env.AWS_BUCKET_REGION
            }
        }));
        console.log(`Bucket ${bucketName} created successfully.`);

        // Disable Block Public Access for the bucket (so we can make objects public)
        console.log(`Disabling public access block for ${bucketName}...`);
        await client.send(new PutBucketPublicAccessBlockCommand({
            Bucket: bucketName,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false,
                RestrictPublicBuckets: false,
            },
        }));

        // Set bucket policy to allow public read access to objects
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${bucketName}/*`,
                },
            ],
        };

        console.log(`Setting public read policy for ${bucketName}...`);
        await client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(policy),
        }));

        console.log("S3 bucket set up successfully with public read access.");
    } catch (err) {
        if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') {
            console.log(`Bucket ${bucketName} already exists.`);
        } else {
            console.error("Error creating bucket:", err);
        }
    }
}

createBucket();
