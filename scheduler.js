const cron = require('node-cron');
const db = require('./database');
const { saveSummaryDoc } = require('./utils/docGenerator');
const config = require('./config');

function getPreviousDayDate() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function getPreviousFridayDate() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysSinceFriday = (dayOfWeek + 2) % 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() - daysSinceFriday);
  return friday.toISOString().split('T')[0];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

async function generateDailySummary() {
  console.log('开始生成日报汇总...');
  
  const endDate = getTodayDate();
  const startDate = getPreviousDayDate();
  
  const query = `
    SELECT 
      id,
      name,
      content,
      date,
      created_at
    FROM reports
    WHERE type = 'daily' 
      AND date >= ? 
      AND date <= ?
    ORDER BY name ASC
  `;
  
  try {
    const summary = db.prepare(query).all(startDate, endDate);
    const { filePath, fileName } = await saveSummaryDoc(summary, 'daily', startDate, endDate);
    console.log('日报汇总文档已生成:', fileName);
    return { success: true, filePath, fileName };
  } catch (error) {
    console.error('日报汇总生成失败:', error);
    return { success: false, error: error.message };
  }
}

async function generateWeeklySummary() {
  console.log('开始生成周报汇总...');
  
  const endDate = getTodayDate();
  const startDate = getPreviousFridayDate();
  
  const query = `
    SELECT 
      id,
      name,
      content,
      date,
      created_at
    FROM reports
    WHERE type = 'weekly' 
      AND date >= ? 
      AND date <= ?
    ORDER BY name ASC
  `;
  
  try {
    const summary = db.prepare(query).all(startDate, endDate);
    const { filePath, fileName } = await saveSummaryDoc(summary, 'weekly', startDate, endDate);
    console.log('周报汇总文档已生成:', fileName);
    return { success: true, filePath, fileName };
  } catch (error) {
    console.error('周报汇总生成失败:', error);
    return { success: false, error: error.message };
  }
}

function initScheduler() {
  console.log('定时任务已禁用');
  console.log('管理员可以手动导出汇总文档');
}

module.exports = { initScheduler, generateDailySummary, generateWeeklySummary };