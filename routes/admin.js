const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/reports', auth, adminAuth, (req, res) => {
  const { type, startDate, endDate, userId } = req.query;
  
  let query = 'SELECT r.*, u.name, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE 1=1';
  const params = [];
  
  if (type) {
    query += ' AND r.type = ?';
    params.push(type);
  }
  
  if (startDate) {
    query += ' AND r.date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND r.date <= ?';
    params.push(endDate);
  }
  
  if (userId) {
    query += ' AND r.user_id = ?';
    params.push(userId);
  }
  
  query += ' ORDER BY r.date DESC, u.name ASC';
  
  try {
    const reports = db.prepare(query).all(...params);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取失败' });
  }
});

router.get('/users', auth, adminAuth, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, email, role, created_at FROM users ORDER BY name ASC').all();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取失败' });
  }
});

router.get('/summary', auth, adminAuth, (req, res) => {
  const { type, startDate, endDate } = req.query;
  
  if (!type || !startDate || !endDate) {
    return res.status(400).json({ error: '类型、开始日期和结束日期为必填项' });
  }
  
  const query = `
    SELECT 
      id,
      name,
      content,
      date,
      created_at
    FROM reports
    WHERE type = ? 
      AND date >= ? 
      AND date <= ?
    ORDER BY 
      CASE 
        WHEN name = '邬雪琴' THEN 0
        WHEN name = '朱颜' THEN 1
        ELSE 2
      END,
      created_at ASC
  `;
  
  try {
    const summary = db.prepare(query).all(type, startDate, endDate);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取汇总失败' });
  }
});

module.exports = router;