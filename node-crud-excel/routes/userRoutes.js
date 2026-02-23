const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// CRUD
router.post('/', user.createUser);
router.get('/', user.getAllUsers);
router.put('/:id', user.updateUser);
router.delete('/:id', user.deleteUser);

// CSV
router.get('/export/csv', user.exportToCsv);
router.post('/import/csv', upload.single('file'), user.importFromCsv);

module.exports = router;
