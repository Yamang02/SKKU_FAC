export default class CloudinaryUrlOptimizer {
    /**
     * Cloudinary URL을 받아 자동 최적화 파라미터를 삽입한 URL을 반환한다.
     * @param {string} url - 원본 Cloudinary 업로드 URL
     * @returns {string} 최적화 옵션이 추가된 URL
     */
    static optimizeImageUrl(url) {
        if (typeof url !== 'string' || url.length === 0) {
            return url;
        }
        // 이미 최적화 파라미터가 포함되어 있으면 그대로 반환
        if (url.includes('/upload/q_auto,f_auto/')) {
            return url;
        }
        // /upload/ 뒤에 q_auto,f_auto 삽입
        return url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
}
