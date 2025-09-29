const express = require('express');
const { body, param } = require('express-validator');
const DailiesController = require('../controllers/dailiesController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const dailyValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid daily task ID')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', DailiesController.getDailies);
router.post('/', dailyValidation, DailiesController.createDaily);
router.put('/:id', [...idValidation, ...dailyValidation], DailiesController.updateDaily);
router.post('/:id/complete', idValidation, DailiesController.completeDaily);
router.delete('/:id', idValidation, DailiesController.deleteDaily);

module.exports = router;