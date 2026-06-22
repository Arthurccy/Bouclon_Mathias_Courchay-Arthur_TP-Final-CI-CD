const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');

jest.mock('../src/models/task');

const tasks = new Map();

function asTaskDocument(task) {
  return {
    id: task.id,
    _id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status || 'todo',
    createdAt: task.createdAt || new Date('2026-01-01T00:00:00.000Z'),
  };
}

beforeEach(() => {
  tasks.clear();
  jest.clearAllMocks();

  Task.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue([]),
  });

  Task.create.mockImplementation(async (payload) => {
    const id = `task-${tasks.size + 1}`;
    const task = asTaskDocument({ id, ...payload });
    tasks.set(id, task);
    return task;
  });

  Task.findById.mockImplementation(async (id) => tasks.get(id) || null);

  Task.findByIdAndUpdate.mockImplementation(async (id, payload) => {
    const task = tasks.get(id);

    if (!task) {
      return null;
    }

    const updatedTask = { ...task, ...payload };
    tasks.set(id, updatedTask);
    return updatedTask;
  });

  Task.findByIdAndDelete.mockImplementation(async (id) => {
    const task = tasks.get(id);
    tasks.delete(id);
    return task || null;
  });
});

test('GET /health returns status 200 and ok payload', async () => {
  const response = await request(app).get('/health');

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('ok');
});

test('POST /api/tasks with an empty title returns 400', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: '', description: 'Invalid task' });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Title is required');
});

test('GET /api/tasks returns an array', async () => {
  const response = await request(app).get('/api/tasks');

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test('POST /api/tasks rejects an invalid status', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Invalid status task', status: 'blocked' });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Invalid task status');
});

test('integration: create a task then retrieve it by id', async () => {
  const createResponse = await request(app)
    .post('/api/tasks')
    .send({
      title: 'Prepare Jenkins pipeline',
      description: 'Create the six required stages',
      status: 'in-progress',
    });

  expect(createResponse.status).toBe(201);

  const getResponse = await request(app).get(`/api/tasks/${createResponse.body.id}`);

  expect(getResponse.status).toBe(200);
  expect(getResponse.body.title).toBe('Prepare Jenkins pipeline');
  expect(getResponse.body.status).toBe('in-progress');
});

test('GET /api/tasks/:id returns 404 when the task does not exist', async () => {
  const response = await request(app).get('/api/tasks/missing-task');

  expect(response.status).toBe(404);
  expect(response.body.message).toBe('Task not found');
});

test('PUT /api/tasks/:id updates the task status', async () => {
  const createResponse = await request(app)
    .post('/api/tasks')
    .send({ title: 'Write README', status: 'todo' });

  const updateResponse = await request(app)
    .put(`/api/tasks/${createResponse.body.id}`)
    .send({ status: 'done' });

  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.status).toBe('done');
});

test('PUT /api/tasks/:id rejects an invalid status', async () => {
  const response = await request(app)
    .put('/api/tasks/task-1')
    .send({ status: 'paused' });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe('Invalid task status');
});

test('PUT /api/tasks/:id returns 404 when the task does not exist', async () => {
  const response = await request(app)
    .put('/api/tasks/missing-task')
    .send({ status: 'done' });

  expect(response.status).toBe(404);
  expect(response.body.message).toBe('Task not found');
});

test('DELETE /api/tasks/:id removes an existing task', async () => {
  const createResponse = await request(app)
    .post('/api/tasks')
    .send({ title: 'Delete me' });

  const deleteResponse = await request(app).delete(`/api/tasks/${createResponse.body.id}`);

  expect(deleteResponse.status).toBe(204);
});

test('DELETE /api/tasks/:id returns 404 when the task does not exist', async () => {
  const response = await request(app).delete('/api/tasks/missing-task');

  expect(response.status).toBe(404);
  expect(response.body.message).toBe('Task not found');
});

test('unknown route returns 404', async () => {
  const response = await request(app).get('/unknown');

  expect(response.status).toBe(404);
  expect(response.body.message).toBe('Route not found');
});

test('GET /api/tasks returns 500 when the model fails', async () => {
  Task.find.mockReturnValue({
    sort: jest.fn().mockRejectedValue(new Error('Database unavailable')),
  });

  const response = await request(app).get('/api/tasks');

  expect(response.status).toBe(500);
  expect(response.body.message).toBe('Database unavailable');
});

test('POST /api/tasks returns 500 when creation fails', async () => {
  Task.create.mockRejectedValue(new Error('Creation failed'));

  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Trigger error' });

  expect(response.status).toBe(500);
  expect(response.body.message).toBe('Creation failed');
});
