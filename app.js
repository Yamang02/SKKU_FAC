const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const homeService = require('./src/domain/home/service/HomeService');

const app = express();

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/presentation/views'));

// 미들웨어 설정
// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'src/presentation')));
app.use('/css', express.static(path.join(__dirname, 'src/presentation/css')));
app.use('/js', express.static(path.join(__dirname, 'src/presentation/js')));
app.use('/images', express.static(path.join(__dirname, 'src/presentation/assets/images')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'skku-gallery-secret',
    resave: false,
    saveUninitialized: true
}));

// 라우터 설정
const exhibitionRouter = require('./src/interface/routes/exhibition');
const noticeRouter = require('./src/interface/routes/notice');
const userRouter = require('./src/interface/routes/user');
const artworkRouter = require('./src/interface/routes/artwork');

app.use('/exhibition', exhibitionRouter);
app.use('/notice', noticeRouter);
app.use('/user', userRouter);
app.use('/artwork', artworkRouter);

// 메인 페이지 라우트
app.get('/', (req, res) => {
    const featuredArtworks = homeService.getFeaturedArtworks();
    res.render('index', {
        title: 'SKKU Faculty Art Gallery',
        featuredArtworks
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 