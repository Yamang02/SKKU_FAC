import multer from 'multer';
import path from 'path';
import { FilePath } from '../constants/Path.js';

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, FilePath.UPLOAD.ARTWORKS);
    },
    filename: function (req, file, cb) {
        // 파일 확장자 추출
        const ext = path.extname(file.originalname);
        // 임시 파일명 생성 (컨트롤러에서 실제 파일명으로 변경)
        const tempFilename = `temp_${Date.now()}${ext}`;
        cb(null, tempFilename);
    }
});

const uploadMiddleware = multer({
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
});

export default uploadMiddleware;
