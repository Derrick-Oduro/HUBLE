const express = require('express');
const { body, param } = require('express-validator');
const RoutinesController = require('../controllers/routinesController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const routineValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Icon must be between 1 and 50 characters'),
  
  body('tasks')
    .isArray({ min: 1 })
    .withMessage('Tasks must be an array with at least one task'),
  
  body('tasks.*')
    .isObject()
    .withMessage('Each task must be an object'),
  
  body('tasks.*.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  
  body('tasks.*.completed')
    .optional()
    .isBoolean()
    .withMessage('Task completed must be a boolean')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid routine ID')
];

const completeValidation = [
  body('completedTasks')
    .optional()
    .isArray()
    .withMessage('Completed tasks must be an array'),
  
  body('completedTasks.*')
    .isInt({ min: 0 })
    .withMessage('Each completed task index must be a non-negative integer')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', RoutinesController.getRoutines);
router.post('/', routineValidation, RoutinesController.createRoutine);
router.put('/:id', [...idValidation, ...routineValidation], RoutinesController.updateRoutine);
router.post('/:id/complete', [...idValidation, ...completeValidation], RoutinesController.completeRoutine);
router.delete('/:id', idValidation, RoutinesController.deleteRoutine);

module.exports = router;