/**
 * AWS S3 Configuration & Multer-S3 Storage Setup
 * This module initializes the S3 client and configures multer to pipe uploads 
 * directly to a specified S3 bucket.
 */
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv");

dotenv.config();

// 1. Initialize the S3 Client with credentials from environment variables
const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

/**
 * 2. Configure Multer-S3 Storage Engine
 * We pipe incoming files directly to S3. 
 * 'acl: public-read' ensures the images are viewable by the frontend users.
 */
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: "public-read",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Create a unique key for each file using a timestamp prefix
            const fileName = `banners/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        // Core validation: Ensure only image mime-types are processed
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Not an image! Please upload an image."), false);
        }
    },
});

module.exports = { s3, upload };
