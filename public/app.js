let currentUser = null;
let currentReportType = 'daily';

function showLoginTab() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.querySelectorAll('#loginPage .tab')[0].classList.add('active');
  document.querySelectorAll('#loginPage .tab')[1].classList.remove('active');
}

function showRegisterTab() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.querySelectorAll('#loginPage .tab')[0].classList.remove('active');
  document.querySelectorAll('#loginPage .tab')[1].classList.add('active');
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      currentUser = data.user;
      showMainPage();
    } else {
      showMessage('authMessage', data.error, 'error');
    }
  } catch (error) {
    showMessage('authMessage', '登录失败，请重试', 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      currentUser = data.user;
      showMainPage();
    } else {
      showMessage('authMessage', data.error, 'error');
    }
  } catch (error) {
    showMessage('authMessage', '注册失败，请重试', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

function showMainPage() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainPage').classList.remove('hidden');
  
  if (currentUser) {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('reportName').value = currentUser.name;
    document.getElementById('reportName').disabled = true;
    
    if (currentUser.role === 'admin') {
      document.getElementById('adminLink').classList.remove('hidden');
    }
  } else {
    document.getElementById('userName').textContent = '访客';
    document.getElementById('reportName').disabled = false;
    document.getElementById('adminLink').classList.add('hidden');
  }
  
  setReportDate();
  setDefaultReportType();
  showSection('write');
}

function showSection(section) {
  document.getElementById('writeSection').classList.add('hidden');
  document.getElementById('historySection').classList.add('hidden');
  document.getElementById('adminSection').classList.add('hidden');
  
  document.getElementById(section + 'Section').classList.remove('hidden');
  
  if (section === 'history') {
    loadHistory();
  } else if (section === 'admin') {
    loadSummary();
  }
}

function setReportType(type) {
  currentReportType = type;
  const tabs = document.querySelectorAll('#writeSection .tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
}

function getDefaultReportType() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  const isWeeklyTime = (dayOfWeek === 1 && hour >= 12) || (dayOfWeek === 5 && hour >= 12) || (dayOfWeek === 6) || (dayOfWeek === 0);
  
  return isWeeklyTime ? 'weekly' : 'daily';
}

function getDefaultReportDate() {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 12) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  } else {
    return now.toISOString().split('T')[0];
  }
}

function setReportDate() {
  const defaultDate = getDefaultReportDate();
  document.getElementById('reportDate').value = defaultDate;
}

function setDefaultReportType() {
  const defaultType = getDefaultReportType();
  currentReportType = defaultType;
  
  const tabs = document.querySelectorAll('#writeSection .tab');
  tabs.forEach((tab, index) => {
    tab.classList.remove('active');
    if ((defaultType === 'daily' && index === 0) || (defaultType === 'weekly' && index === 1)) {
      tab.classList.add('active');
    }
  });
}

async function handleSubmitReport(event) {
  event.preventDefault();
  const name = document.getElementById('reportName').value;
  const date = document.getElementById('reportDate').value;
  const content = document.getElementById('reportContent').value;
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ type: currentReportType, content, date, name })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('reportMessage', data.message, 'success');
      document.getElementById('reportContent').value = '';
      if (!currentUser) {
        document.getElementById('reportName').value = '';
      }
    } else {
      showMessage('reportMessage', data.error, 'error');
    }
  } catch (error) {
    showMessage('reportMessage', '提交失败，请重试', 'error');
  }
}

async function loadHistory() {
  const type = document.getElementById('historyType').value;
  const startDate = document.getElementById('historyStartDate').value;
  const endDate = document.getElementById('historyEndDate').value;
  
  let url = '/api/reports?';
  if (type) url += `type=${type}&`;
  if (startDate) url += `startDate=${startDate}&`;
  if (endDate) url += `endDate=${endDate}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const reports = await response.json();
    displayReports(reports);
  } catch (error) {
    document.getElementById('historyList').innerHTML = '<p class="loading">加载失败</p>';
  }
}

function displayReports(reports) {
  const container = document.getElementById('historyList');
  
  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无记录</p>';
    return;
  }
  
  container.innerHTML = reports.map(report => `
    <div class="report-item">
      <div class="report-item-header">
        <span class="report-item-type">${report.type === 'daily' ? '日报' : '周报'}</span>
        <span class="report-item-date">${report.date}</span>
      </div>
      <div class="report-item-content">${escapeHtml(report.content)}</div>
      <div class="report-item-actions">
        <button class="btn btn-danger btn-sm" onclick="deleteReport(${report.id})">删除</button>
      </div>
    </div>
  `).join('');
}

async function deleteReport(id) {
  if (!confirm('确定要删除这条报告吗？')) return;
  
  try {
    const response = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      loadHistory();
    } else {
      alert('删除失败');
    }
  } catch (error) {
    alert('删除失败');
  }
}

function showAdminTab(tab) {
  document.getElementById('summaryTab').classList.add('hidden');
  document.getElementById('usersTab').classList.add('hidden');
  
  document.getElementById(tab + 'Tab').classList.remove('hidden');
  
  const tabs = document.querySelectorAll('#adminSection .tab');
  tabs.forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  if (tab === 'summary') {
    loadSummary();
  } else {
    loadUsers();
  }
}

async function loadSummary() {
  const type = document.getElementById('summaryType').value;
  const startDate = document.getElementById('summaryStartDate').value;
  const endDate = document.getElementById('summaryEndDate').value;
  
  if (!startDate || !endDate) {
    document.getElementById('summaryList').innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">请选择开始和结束日期</p>';
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/summary?type=${type}&startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const summary = await response.json();
    displaySummary(summary);
  } catch (error) {
    document.getElementById('summaryList').innerHTML = '<p class="loading">加载失败</p>';
  }
}

function displaySummary(summary) {
  const container = document.getElementById('summaryList');
  
  if (summary.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无数据</p>';
    return;
  }
  
  container.innerHTML = `
    <table class="summary-table">
      <thead>
        <tr>
          <th>姓名</th>
          <th>内容</th>
          <th>日期</th>
        </tr>
      </thead>
      <tbody>
        ${summary.map(item => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.content ? escapeHtml(item.content) : '<span class="no-report">未提交</span>'}</td>
            <td>${item.date || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function exportSummary() {
  const type = document.getElementById('summaryType').value;
  const startDate = document.getElementById('summaryStartDate').value;
  const endDate = document.getElementById('summaryEndDate').value;
  
  if (!startDate || !endDate) {
    alert('请选择开始和结束日期');
    return;
  }
  
  try {
    const response = await fetch(`/api/export/export?type=${type}&startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) {
      const data = await response.json();
      alert('导出失败: ' + (data.error || '未知错误'));
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const reportType = type === 'daily' ? '日报' : '周报';
    a.download = `${startDate} AI投研研究个人${reportType}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    alert('导出失败，请重试');
  }
}

async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const users = await response.json();
    displayUsers(users);
  } catch (error) {
    document.getElementById('usersList').innerHTML = '<p class="loading">加载失败</p>';
  }
}

function displayUsers(users) {
  const container = document.getElementById('usersList');
  
  if (users.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无用户</p>';
    return;
  }
  
  container.innerHTML = `
    <table class="summary-table">
      <thead>
        <tr>
          <th>姓名</th>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>注册时间</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${user.email ? escapeHtml(user.email) : '-'}</td>
            <td>${user.role === 'admin' ? '管理员' : '成员'}</td>
            <td>${new Date(user.created_at).toLocaleDateString('zh-CN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    element.innerHTML = '';
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    currentUser = JSON.parse(user);
  }
  
  showMainPage();
});