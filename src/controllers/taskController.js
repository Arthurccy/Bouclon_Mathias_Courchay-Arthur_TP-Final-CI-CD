const Task = require('../models/task');

const allowedStatuses = ['todo', 'in-progress', 'done'];

function isBlank(value) {
  return typeof value !== 'string' || value.trim().length === 0;
}

async function listTasks(request, response, next) {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    response.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function createTask(request, response, next) {
  try {
    const { title, description, status } = request.body;

    if (isBlank(title)) {
      response.status(400).json({ message: 'Title is required' });
      return;
    }

    if (status && !allowedStatuses.includes(status)) {
      response.status(400).json({ message: 'Invalid task status' });
      return;
    }

    const task = await Task.create({ title, description, status });
    response.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function getTaskById(request, response, next) {
  try {
    const task = await Task.findById(request.params.id);

    if (!task) {
      response.status(404).json({ message: 'Task not found' });
      return;
    }

    response.json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTaskStatus(request, response, next) {
  try {
    const { status } = request.body;

    if (!allowedStatuses.includes(status)) {
      response.status(400).json({ message: 'Invalid task status' });
      return;
    }

    const task = await Task.findByIdAndUpdate(
      request.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!task) {
      response.status(404).json({ message: 'Task not found' });
      return;
    }

    response.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(request, response, next) {
  try {
    const task = await Task.findByIdAndDelete(request.params.id);

    if (!task) {
      response.status(404).json({ message: 'Task not found' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTaskStatus,
};
