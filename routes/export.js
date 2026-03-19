const express = require('express');
const router = express.Router();
const db = require('../database');
const { auth, adminAuth } = require('../middleware/auth');
const { saveSummaryDoc } = require('../utils/docGenerator');

router.get('/export', auth, adminAuth, async (req, res) => {
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
    const { filePath, fileName } = await saveSummaryDoc(summary, type, startDate, endDate);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('下载失败:', err);
        res.status(500).json({ error: '下载失败' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '导出失败' });
  }
});

module.exports = router;