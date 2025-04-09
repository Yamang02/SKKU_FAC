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
    const folder = folderMap[type] || folderMap.default;

    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        }
    });
};
