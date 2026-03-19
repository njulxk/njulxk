const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const config = require('../config');

router.post('/register', (req, res) => {
  const { username, password, name, email } = req.body;
  
  if (!username || !password || !name) {
    return res.status(400).json({ error: '用户名、密码和姓名为必填项' });
  }
  
  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)')
      .run(username, hashedPassword, name, email);
    
    const token = jwt.sign({ id: result.lastInsertRowid, username, role: 'member' }, config.jwtSecret, { expiresIn: '7d' });
    
    res.json({ token, user: { id: result.lastInsertRowid, username, name, email, role: 'member' } });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码为必填项' });
  }
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
  
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;