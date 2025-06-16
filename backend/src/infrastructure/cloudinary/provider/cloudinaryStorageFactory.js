import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import config from '../../../config/Config.js';

// Cloudinary 설정
const storageConfig = config.getStorageConfig();

cloudinary.config({
    cloud_name: storageConfig.cloudinary.cloudName,
    api_key: storageConfig.cloudinary.apiKey,
    api_secret: storageConfig.cloudinary.apiSecret
});

// 현재 환경 가져오기
const currentEnvironment = config.getEnvironment();

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

/**
 * Cloudinary 이미지 삭제 함수
 * @param {string} publicId - 삭제할 이미지의 public_id
 * @returns {Promise<Object>} - 삭제 결과 객체
 */
export const deleteCloudinaryImage = async publicId => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary 이미지 삭제 중 오류 발생:', error);
        throw error;
    }
};

/**
 * Cloudinary 객체 가져오기 (고급 사용 사례용)
 * @returns {Object} - cloudinary v2 객체
 */
export const getCloudinary = () => {
    return cloudinary;
};
