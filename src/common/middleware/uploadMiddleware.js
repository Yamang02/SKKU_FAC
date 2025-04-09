import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { infrastructureConfig } from '../../config/infrastructure.js';

// Cloudinary 설정
const cloudConfig = infrastructureConfig.storage.config;
console.log('Cloudinary 설정 확인 (API 키와 시크릿은 보안상 마스킹):', {
    cloud_name: cloudConfig.cloudName,
    api_key: cloudConfig.apiKey ? '설정됨' : '설정되지 않음',
    api_secret: cloudConfig.apiSecret ? '설정됨' : '설정되지 않음'
});

try {
    cloudinary.config({
        cloud_name: cloudConfig.cloudName,
        api_key: cloudConfig.apiKey,
        api_secret: cloudConfig.apiSecret
    });
    console.log('Cloudinary 설정 완료');
} catch (error) {
    console.error('Cloudinary 설정 오류:', error);
}

// CloudinaryStorage 설정
let storage;
try {
    storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'uploads', // 원하는 Cloudinary 폴더명
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        }
    });
    console.log('Cloudinary 스토리지 설정 완료');
} catch (error) {
    console.error('Cloudinary 스토리지 설정 오류:', error);
    // 오류 발생 시 로컬 스토리지로 대체
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
    console.log('로컬 스토리지로 대체 설정 완료');
}

// 업로드 미들웨어 생성
const uploadMiddlewareInstance = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF 파일만 업로드 가능합니다.'));
        }
    }
}).single('image');

// 세션 유지를 위한 래퍼 함수
const uploadMiddleware = (req, res, next) => {
    console.log('업로드 미들웨어 시작');
    console.log('세션 정보(처리 전):', req.session ? '있음' : '없음');

    const sessionData = req.session;

    uploadMiddlewareInstance(req, res, (err) => {
        if (err) {
            console.error('파일 업로드 중 오류:', err);
            return res.status(400).json({
                success: false,
                error: err.message || '파일 업로드 중 오류가 발생했습니다.'
            });
        }

        console.log('파일 업로드 완료, 세션 복원 시도');
        req.session = sessionData;
        console.log('세션 정보(처리 후):', req.session ? '있음' : '없음');
        console.log('업로드된 파일 정보:', req.file ? '있음' : '없음');

        next();
    });
};

export default uploadMiddleware;
