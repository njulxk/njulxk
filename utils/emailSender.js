const nodemailer = require('nodemailer');
const config = require('../config');

let transporter;

function initTransporter() {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

async function sendSummaryEmail(filePath, fileName, type, startDate, endDate) {
  if (!transporter) {
    initTransporter();
  }
  
  const reportType = type === 'daily' ? '日报' : '周报';
  const subject = `${reportType}汇总 (${startDate} 至 ${endDate})`;
  const text = `附件是${reportType}汇总文档，请查收。\n\n时间范围: ${startDate} 至 ${endDate}\n生成时间: ${new Date().toLocaleString('zh-CN')}`;
  
  const mailOptions = {
    from: config.email.user,
    to: config.email.adminEmail,
    subject: subject,
    text: text,
    attachments: [
      {
        filename: fileName,
        path: filePath,
      },
    ],
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendSummaryEmail };