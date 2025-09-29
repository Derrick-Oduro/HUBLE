const express = require('express');
const { body, param } = require('express-validator');
const HabitsController = require('../controllers/habitsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const habitValidation = [
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
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('color')
    .optional()
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Invalid color format'),
  
  body('target_days')
    .isArray({ min: 1 })
    .withMessage('Target days must be an array with at least one day')
    .custom((value) => {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return value.every(day => validDays.includes(day.toLowerCase()));
    })
    .withMessage('Invalid day in target_days')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid habit ID')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', HabitsController.getHabits);
router.post('/', habitValidation, HabitsController.createHabit);
router.put('/:id', [...idValidation, ...habitValidation], HabitsController.updateHabit);
router.post('/:id/complete', idValidation, HabitsController.completeHabit);
router.get('/:id/history', idValidation, HabitsController.getHabitHistory);
router.delete('/:id', idValidation, HabitsController.deleteHabit);

module.exports = router;