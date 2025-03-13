// module-alias 등록 (가장 먼저 로드되어야 함)
// import 'module-alias/register.js';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import { getFeaturedArtworks } from './src/domain/home/service/HomeService.js';
import * as dotenv from 'dotenv';
import apiRouter from './src/interface/router/index.js';

// 환경 변수 로드
dotenv.config({ path: './config/.env' });

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/presentation/view'));

// 미들웨어 설정
// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'src/presentation')));
app.use('/css', express.static(path.join(__dirname, 'src/presentation/css')));
app.use('/js', express.static(path.join(__dirname, 'src/presentation/js')));
app.use('/image', express.static(path.join(__dirname, 'src/presentation/asset/image')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'skku-gallery-secret',
    resave: false,
    saveUninitialized: true
}));

// API 라우터 설정
app.use('/', apiRouter);

// 메인 페이지 라우트
app.get('/', (req, res) => {
    const featuredArtworks = getFeaturedArtworks();
    res.render('home/HomePage', {
        title: 'SKKU Fine Art Gallery',
        featuredArtworks
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
