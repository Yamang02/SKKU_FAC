
/**
 * URL로부터 QR 코드 데이터 URL을 생성합니다.
 * @param {string} url - QR 코드로 변환할 URL
 * @param {Object} options - QR 코드 생성 옵션
 * @returns {Promise<string>} QR 코드 데이터 URL
 */
export async function generateQRCodeDataURL(url, options = {}) {
    try {

        // 전역 QRCode 객체 사용 (CDN에서 로드됨)
        if (typeof QRCode === 'undefined') {
            throw new Error('QRCode 라이브러리가 로드되지 않았습니다.');
        }

        const defaultOptions = {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        return await QRCode.toDataURL(url, mergedOptions);
    } catch (error) {
        console.error('QR 코드 생성 중 오류:', error);
        throw new Error('QR 코드를 생성할 수 없습니다.');
    }
}
