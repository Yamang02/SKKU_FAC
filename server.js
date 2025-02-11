const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 정적 파일 서빙 설정
app.use(express.static('public'));

// 루트 경로로 요청이 들어왔을 때 index.html 파일 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
