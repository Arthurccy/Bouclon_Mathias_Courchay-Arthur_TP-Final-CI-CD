const express = require('express');
const {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTaskStatus,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', listTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
