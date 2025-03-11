/**
 * 전시 상세 페이지 - 이미지 로더 모듈
 * 이미지 지연 로딩 기능을 처리합니다.
 */

/**
 * 이미지 로더 초기화
 */
export function initImageLoader() {
    // 이미지 지연 로딩 처리
    const lazyImages = document.querySelectorAll('.artwork-image');

    if (!lazyImages.length) return;

    if ('IntersectionObserver' in window) {
        // IntersectionObserver 사용 (모던 브라우저)
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        imageObserver.unobserve(image);
                    }
                }
            });
        });

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // IntersectionObserver를 지원하지 않는 브라우저를 위한 폴백
        lazyImages.forEach(image => {
            if (image.dataset.src) {
                image.src = image.dataset.src;
            }
        });
    }
}

/**
 * 이미지 오류 처리
 * @param {HTMLImageElement} img - 이미지 요소
 * @param {string} fallbackSrc - 대체 이미지 경로
 */
export function handleImageError(img, fallbackSrc = '/images/default-artwork.svg') {
    if (!img) return;

    img.onerror = () => {
        img.src = fallbackSrc;
        img.onerror = null; // 무한 루프 방지
    };
}
