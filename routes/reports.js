const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth } = require('../middleware/auth');

router.post('/', (req, res) => {
  const { type, content, date, name } = req.body;
  const userId = req.user ? req.user.id : null;
  const userName = req.user ? req.user.name : name;
  
  if (!type || !content || !date || !userName) {
    return res.status(400).json({ error: '姓名、类型、内容和日期为必填项' });
  }
  
  if (!['daily', 'weekly'].includes(type)) {
    return res.status(400).json({ error: '类型必须是 daily 或 weekly' });
  }
  
  try {
    const existingReport = db.prepare('SELECT id FROM reports WHERE name = ? AND type = ? AND date = ?')
      .get(userName, type, date);
    
    if (existingReport) {
      db.prepare('UPDATE reports SET content = ? WHERE id = ?').run(content, existingReport.id);
      res.json({ id: existingReport.id, message: '更新成功' });
    } else {
      const result = db.prepare('INSERT INTO reports (user_id, name, type, content, date) VALUES (?, ?, ?, ?, ?)')
        .run(userId, userName, type, content, date);
      res.json({ id: result.lastInsertRowid, message: '创建成功' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '保存失败' });
  }
});

router.get('/', auth, (req, res) => {
  const { type, startDate, endDate } = req.query;
  const userId = req.user.id;
  
  let query = 'SELECT r.*, u.name, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE r.user_id = ?';
  const params = [userId];
  
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
  
  query += ' ORDER BY r.date DESC, r.created_at DESC';
  
  try {
    const reports = db.prepare(query).all(...params);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取失败' });
  }
});

router.get('/:id', auth, (req, res) => {
  const { id } = req.params;
  
  try {
    const report = db.prepare('SELECT r.*, u.name, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE r.id = ?')
      .get(id);
    
    if (!report) {
      return res.status(404).json({ error: '报告不存在' });
    }
    
    if (report.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问' });
    }
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取失败' });
  }
});

router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  
  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    
    if (!report) {
      return res.status(404).json({ error: '报告不存在' });
    }
    
    if (report.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除' });
    }
    
    db.prepare('DELETE FROM reports WHERE id = ?').run(id);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;