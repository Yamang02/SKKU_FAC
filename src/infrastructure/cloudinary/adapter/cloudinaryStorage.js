import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { infrastructureConfig } from '../../../config/infrastructure.js';

// Cloudinary 설정
const cloudConfig = infrastructureConfig.storage.config;

cloudinary.config({
    cloud_name: cloudConfig.cloudName,
    api_key: cloudConfig.apiKey,
    api_secret: cloudConfig.apiSecret
});

// Storage 생성
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'local-test-folder', // Cloudinary 내 폴더 이름
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

export default cloudinaryStorage;
