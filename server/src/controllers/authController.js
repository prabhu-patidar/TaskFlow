import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const makeToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email is already registered' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');
    if (!user || !await bcrypt.compare(password || '', user.password)) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: makeToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
}
export function me(req, res) { res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } }); }
