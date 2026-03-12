// Imports
const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller.js');
const authenticateToken = require('../middlewares/auth.middleware.js');

// Private
router.use(authenticateToken);

// Retrieves
router.get('/active', (req, res, next) => todoController.getActiveTodos(req, res, next));
router.get('/expired', (req, res, next) => todoController.getExpiredTodos(req, res, next));
router.get('/trashed', (req, res, next) => todoController.getTrashedTodos(req, res, next));

// Action
router.post('/', (req, res, next) => todoController.createTodo(req, res, next));
router.put('/:id', (req, res, next) => todoController.updateTodo(req, res, next));
router.delete('/:id', (req, res, next) => todoController.deleteTodo(req, res, next));
router.put('/:id/restore', (req, res, next) => todoController.restoreTodo(req, res, next));

// Exports
module.exports = router;
