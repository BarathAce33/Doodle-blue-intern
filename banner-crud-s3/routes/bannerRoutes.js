const express                                   = require('express');
const router                                    = express.Router();
const { createBanner, getAllBanners,
        getBannerById, updateBanner,
        deleteBanner }                          = require('../controllers/bannerController');
const { uploadBannerImages,
        validateFieldTypes }                    = require('../middleware/upload');
const { validate, validateQuery }               = require('../middleware/validator');
const { createBannerSchema, updateBannerSchema,
        paginationSchema }                      = require('../validators/bannerValidator');

// Create Banner 
router.post('/',    uploadBannerImages, validateFieldTypes, validate(createBannerSchema), createBanner);

// Get All Banners 
router.get('/',     validateQuery(paginationSchema), getAllBanners);

// Get Single Banner 
router.get('/:id',  getBannerById);

// Update Banner 
router.put('/:id',  uploadBannerImages, validateFieldTypes, validate(updateBannerSchema), updateBanner);

// Delete Banner 
router.delete('/:id', deleteBanner);

module.exports = router;