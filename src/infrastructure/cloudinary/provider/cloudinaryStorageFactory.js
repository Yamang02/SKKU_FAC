import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { infrastructureConfig } from '../../../config/infrastructure.js';

// Cloudinary 설정
const cloudConfig = infrastructureConfig.storage.config;

cloudinary.config({
    cloud_name: cloudConfig.cloudName,
    api_key: cloudConfig.apiKey,
    api_secret: cloudConfig.apiSecret
});

// 현재 환경 가져오기
const currentEnvironment = cloudConfig.environment || infrastructureConfig.environment || 'development';

// 폴더 매핑
const folderMap = {
    artwork: 'artworks',
    profile: 'profiles',
    exhibition: 'exhibitions',
    announcement: 'announcements',
    default: 'uploads'
};

// storage 생성 함수
export const createCloudinaryStorage = (type = 'default') => {
    // 현재 환경과 리소스 타입을 기반으로 폴더 경로 생성
    const resourceFolder = folderMap[type] || folderMap.default;
    const folder = `${currentEnvironment}/${resourceFolder}`;

    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        }
    });
};
