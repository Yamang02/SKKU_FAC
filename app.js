const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// 미들웨어 설정
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'skku-gallery-secret',
    resave: false,
    saveUninitialized: true
}));

// 라우터 설정
const exhibitionRouter = require('./src/routes/exhibition');
const noticeRouter = require('./src/routes/notice');
const userRouter = require('./src/routes/user');

app.use('/exhibition', exhibitionRouter);
app.use('/notice', noticeRouter);
app.use('/user', userRouter);

// 메인 페이지 라우트
app.get('/', (req, res) => {
    res.render('index', {
        title: 'SKKU Faculty Art Gallery'
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 