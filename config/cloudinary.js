import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Cloudinary 설정
 * 환경 변수에서 Cloudinary 관련 설정을 가져옵니다.
 */
export const cloudinaryConfig = {
    // 기본 인증 설정
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,

    // 폴더 구조 설정
    folders: {
        root: isDevelopment ? 'development' : 'production',
        artwork: 'artworks',
        exhibition: 'exhibitions',
        profile: 'profiles',
        temp: 'temp'
    },

    // 업로드 옵션 설정
    options: {
        // 이미지 품질 및 포맷 설정
        quality: 'auto',
        fetch_format: 'auto',

        // 이미지 변환 설정
        transformation: {
            artwork: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            exhibition: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            profile: [
                { width: 300, height: 300, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            thumbnail: [
                { width: 200, height: 200, crop: 'fill' },
                { quality: 'auto', fetch_format: 'auto' }
            ]
        },

        // 접근 제어 설정
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        unique_filename: true,
        overwrite: false,

        // 태그 및 메타데이터 설정
        tags: isDevelopment ? ['development'] : ['production'],
        use_filename: true,
        unique_filename: true
    }
};

/**
 * 파일 업로드 경로를 생성합니다.
 * @param {string} type - 업로드 타입 (artwork, exhibition, profile)
 * @param {string} filename - 파일 이름
 * @returns {string} Cloudinary 업로드 경로
 */
export const getUploadPath = (type, filename) => {
    const { folders } = cloudinaryConfig;
    return `${folders.root}/${folders[type]}/${filename}`;
};

export default cloudinaryConfig;
