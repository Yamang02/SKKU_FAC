import multer from 'multer';
import { createCloudinaryStorage } from '../../infrastructure/cloudinary/provider/cloudinaryStorageFactory.js';

export const imageUploadMiddleware = (type = 'default') => {
    let storage;

    try {
        storage = createCloudinaryStorage(type);
    } catch (error) {
        console.error('CloudinaryStorage 생성 실패, 로컬 fallback 사용:', error);
        storage = multer.diskStorage({
            destination: './uploads/',
            filename: (req, file, cb) => {
                cb(null, Date.now() + '-' + file.originalname);
            }
        });
    }

    return multer({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('지원하지 않는 파일 형식입니다.'));
            }
        }
    }).single('image');
};
