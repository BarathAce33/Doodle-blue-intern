/**
 * S3 Deletion Helper
 * Provides utility functions to interface with the AWS SDK for object cleanup.
 */
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/s3Config");

/**
 * Deletes an object from S3 given its full URL or key
 * The logic automatically parses full URLs to extract the S3 Key.
 * 
 * @param {string} fileUrl - The full S3 URL or relative key of the file
 */
const deleteS3Image = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        let key;
        // If it's a full URL, we need to extract the portion after the domain
        if (fileUrl.startsWith("http")) {
            const url = new URL(fileUrl);
            key = url.pathname.startsWith("/") ? url.pathname.substring(1) : url.pathname;
        } else {
            key = fileUrl;
        }

        console.log(`🗑️  Removing from S3: ${key}`);
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });
        await s3.send(command);
    } catch (error) {
        console.error("CRITICAL: Error deleting image from S3:", error);
    }
};

module.exports = { deleteS3Image };
