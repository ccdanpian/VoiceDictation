const express = require('express');
const app = express();
const path = require('path');

const dotenv = require('dotenv');

// 加载 .env 文件中的环境变量
dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 创建一个新的端点，用于返回环境变量
app.get('/env', (req, res) => {
  res.json({
    appId: process.env.XF_APP_ID,
    apiSecret: process.env.XF_API_SECRET,
    apiKey: process.env.XF_API_KEY
  });
});

const PORT = process.env.PORT || 21132;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
