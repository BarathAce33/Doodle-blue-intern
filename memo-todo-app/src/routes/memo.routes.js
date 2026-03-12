// Imports
const express = require('express');
const router = express.Router();
const memoController = require('../controllers/memo.controller.js');
const authenticateToken = require('../middlewares/auth.middleware.js');

// Private
router.use(authenticateToken);

// Retrieves
router.get('/active', (req, res, next) => memoController.getActiveMemos(req, res, next));
router.get('/trashed', (req, res, next) => memoController.getTrashedMemos(req, res, next));

// Action
router.post('/', (req, res, next) => memoController.createMemo(req, res, next));
router.put('/:id', (req, res, next) => memoController.updateMemo(req, res, next));
router.delete('/:id', (req, res, next) => memoController.deleteMemo(req, res, next));
router.put('/:id/restore', (req, res, next) => memoController.restoreMemo(req, res, next));

// Exports
module.exports = router;
