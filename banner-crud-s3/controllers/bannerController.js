const Banner = require('../models/Banner');
const { getPagination, successResponse, errorResponse } = require('../helpers/bannerHelper');
const { deleteS3Image } = require('../helpers/s3Helper');

/**
 * @controller BannerController
 * Handles CRUD operations for Banners using AWS S3 for image storage.
 */

/**
 * Create Banner
 * 1. Validates presence of images
 * 2. Persists metadata to MongoDB
 * 3. Handles S3 cleanup if database insertion fails (preventing orphaned files)
 */
const createBanner = async (req, res) => {
  try {
    const { name, link, status } = req.body;

    if (!req.files?.desktopImage || !req.files?.mobileImage) {
      return errorResponse(res, 400,
        'Bad Request - Missing required image fields',
        'Both "desktopImage" and "mobileImage" files are required'
      );
    }

    const banner = await Banner.create({
      name,
      link,
      status: status || 'active',
      // Note: multer-s3 attaches the full URL as 'location'
      desktopImage: req.files.desktopImage[0].location,
      mobileImage: req.files.mobileImage[0].location
    });

    return successResponse(res, 201, 'Created - Banner created successfully', banner);
  } catch (error) {
    // AUTO-CLEANUP: If DB save fails, we must remove uploaded images from S3 
    // to avoid wasted storage and unlinked files.
    if (req.files?.desktopImage) await deleteS3Image(req.files.desktopImage[0].location);
    if (req.files?.mobileImage) await deleteS3Image(req.files.mobileImage[0].location);
    return errorResponse(res, 500, 'Internal Server Error - Failed to create banner', error.message);
  }
};

/**
 * Fetch All Banners
 * Implements ascending sort (chronological) and pagination.
 */
const getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      Banner.find().sort({ createdAt: 1 }).skip(skip).limit(parseInt(limit)),
      Banner.countDocuments()
    ]);

    return successResponse(res, 200, 'OK - Banners fetched successfully', banners, {
      pagination: getPagination(page, limit, total)
    });
  } catch (error) {
    return errorResponse(res, 500, 'Internal Server Error - Failed to fetch banners', error.message);
  }
};

/**
 * Update Banner
 * Handles partial updates and replaces images in S3 as needed.
 */
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      // Cleanup new uploads if target resource is missing
      if (req.files?.desktopImage) await deleteS3Image(req.files.desktopImage[0].location);
      if (req.files?.mobileImage) await deleteS3Image(req.files.mobileImage[0].location);
      return errorResponse(res, 404, 'Not Found - Banner does not exist');
    }

    const { name, link, status } = req.body;

    if (name) banner.name = name;
    if (link) banner.link = link;
    if (status) banner.status = status;

    // Replace images in S3 if new files are uploaded
    if (req.files?.desktopImage) {
      await deleteS3Image(banner.desktopImage);
      banner.desktopImage = req.files.desktopImage[0].location;
    }
    if (req.files?.mobileImage) {
      await deleteS3Image(banner.mobileImage);
      banner.mobileImage = req.files.mobileImage[0].location;
    }

    await banner.save();
    return successResponse(res, 200, 'OK - Banner updated successfully', banner);
  } catch (error) {
    // Cleanup new uploads on failure
    if (req.files?.desktopImage) await deleteS3Image(req.files.desktopImage[0].location);
    if (req.files?.mobileImage) await deleteS3Image(req.files.mobileImage[0].location);
    return errorResponse(res, 500, 'Internal Server Error - Failed to update banner', error.message);
  }
};

/**
 * Delete Banner
 * Ensures the binary data (images) are purged from S3 before deleting metadata.
 */
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return errorResponse(res, 404, 'Not Found - Banner does not exist');

    // Remove from S3 storage
    await deleteS3Image(banner.desktopImage);
    await deleteS3Image(banner.mobileImage);

    // Remove from MongoDB
    await Banner.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'OK - Banner deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Internal Server Error - Failed to delete banner', error.message);
  }
};

module.exports = { createBanner, getAllBanners, getBannerById, updateBanner, deleteBanner };