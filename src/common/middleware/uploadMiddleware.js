import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { infrastructureConfig } from '../../config/infrastructure.js';

// Cloudinary 설정
const cloudConfig = infrastructureConfig.storage.config;
cloudinary.config({
    cloud_name: cloudConfig.cloudName,
    api_key: cloudConfig.apiKey,
    api_secret: cloudConfig.apiSecret
});

// CloudinaryStorage 설정
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'uploads', // 원하는 Cloudinary 폴더명
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

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
    const sessionData = req.session;

    uploadMiddlewareInstance(req, res, (err) => {
        if (err) {
            return next(err);
        }

        req.session = sessionData;
        next();
    });
};

export default uploadMiddleware;
