import multer from 'multer';

// 파일 업로드 설정
const storage = multer.memoryStorage();

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
    // 세션 정보 저장
    const sessionData = req.session;

    uploadMiddlewareInstance(req, res, (err) => {
        if (err) {
            return next(err);
        }

        // 세션 정보 복원
        req.session = sessionData;
        next();
    });
};

export default uploadMiddleware;
