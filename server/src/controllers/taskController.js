import Task from '../models/Task.js';
const fields = ['title', 'description', 'status', 'priority', 'dueDate'];
const clean = body => Object.fromEntries(fields.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
export async function listTasks(req, res, next) {
  try {
    const filter = { user: req.user.id };
    if (['todo','in-progress','done'].includes(req.query.status)) filter.status = req.query.status;
    if (['low','medium','high'].includes(req.query.priority)) filter.priority = req.query.priority;
    if (req.query.search) filter.$or = ['title','description'].map(k => ({ [k]: { $regex: req.query.search.slice(0, 80), $options: 'i' } }));
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ tasks });
  } catch (e) { next(e); }
}
export async function createTask(req, res, next) {
  try {
    if (!req.body.title?.trim()) return res.status(400).json({ message: 'Task title is required' });
    const task = await Task.create({ ...clean(req.body), title: req.body.title.trim(), user: req.user.id });
    res.status(201).json({ task });
  } catch (e) { next(e); }
}
export async function getTask(req, res, next) {
  try { const task = await Task.findOne({ _id: req.params.id, user: req.user.id }); if (!task) return res.status(404).json({ message: 'Task not found' }); res.json({ task }); }
  catch (e) { next(e); }
}
export async function updateTask(req, res, next) {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, clean(req.body), { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (e) { next(e); }
}
export async function deleteTask(req, res, next) {
  try { const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id }); if (!task) return res.status(404).json({ message: 'Task not found' }); res.json({ message: 'Task deleted' }); }
  catch (e) { next(e); }
}
