/**
 * 작품 상세 페이지 - 이미지 뷰어 모듈
 * 작품 이미지 뷰어 및 Sticky 기능을 처리합니다.
 */

/**
 * 이미지 뷰어 기능 초기화
 */
export function initImageViewer() {
    // Sticky 이미지 섹션 초기화
    initStickyImageSection();

    // 이미지 확대/축소 기능 초기화
    initImageZoom();
}

/**
 * Sticky 이미지 섹션 초기화
 */
function initStickyImageSection() {
    const imageSection = document.querySelector('.artwork-image-section');
    const infoSection = document.querySelector('.artwork-info-section');

    if (!imageSection || !infoSection) return;

    // 초기 위치 설정
    updateStickyPosition();

    // 스크롤 이벤트
    window.addEventListener('scroll', updateStickyPosition);
    window.addEventListener('resize', updateStickyPosition);

    /**
     * Sticky 위치 업데이트
     */
    function updateStickyPosition() {
        const imageSectionHeight = imageSection.offsetHeight;
        const infoSectionHeight = infoSection.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 이미지 섹션이 정보 섹션보다 짧은 경우에만 Sticky 적용
        if (imageSectionHeight < infoSectionHeight) {
            // 스크롤 위치에 따라 Sticky 클래스 토글
            if (scrollTop > 100) {
                imageSection.classList.add('sticky');

                // 하단에 도달했을 때 Sticky 해제
                const bottomLimit = infoSection.offsetTop + infoSectionHeight - imageSectionHeight - 40;
                if (scrollTop > bottomLimit) {
                    imageSection.classList.remove('sticky');
                    imageSection.classList.add('at-bottom');
                } else {
                    imageSection.classList.remove('at-bottom');
                }
            } else {
                imageSection.classList.remove('sticky');
                imageSection.classList.remove('at-bottom');
            }
        }
    }
}

/**
 * 이미지 확대/축소 기능 초기화
 */
function initImageZoom() {
    const artworkImage = document.querySelector('.artwork-image');
    const imageWrapper = document.querySelector('.artwork-image-wrapper');

    if (!artworkImage || !imageWrapper) return;

    let isZoomed = false;

    // 이미지 클릭 이벤트
    artworkImage.addEventListener('click', () => {
        if (isZoomed) {
            // 축소
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
        } else {
            // 확대
            artworkImage.classList.add('zoomed');
            imageWrapper.classList.add('zoomed-wrapper');
        }

        isZoomed = !isZoomed;
    });

    // 확대 상태에서 이미지 외부 클릭 시 축소
    document.addEventListener('click', (e) => {
        if (isZoomed && e.target !== artworkImage) {
            artworkImage.classList.remove('zoomed');
            imageWrapper.classList.remove('zoomed-wrapper');
            isZoomed = false;
        }
    });

    // 이미지 클릭 이벤트 전파 중지
    artworkImage.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}
