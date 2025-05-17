/**
 * 작품 카드를 생성하는 유틸리티 함수
 * @param {Object} artwork - 작품 데이터 객체
 * @param {Object} options - 카드 생성 옵션
 * @param {string} options.type - 카드 타입 ('home' 또는 'list')
 * @returns {HTMLElement} 생성된 카드 엘리먼트
 */
export function createArtworkCard(artwork, options = { type: 'home' }) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.artworkId = artwork.id;

    const link = document.createElement('a');
    link.className = 'card__link';

    // 목록 페이지에서만 실제 링크 사용
    if (options.type === 'list') {
        link.href = `/artwork/${artwork.slug}`;
    } else {
        link.role = 'button';
        link.style.cursor = 'pointer';
    }

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card__image-container';

    const image = document.createElement('img');
    image.className = 'card__image';
    image.src = artwork.imageUrl || '/images/artwork-placeholder.svg';
    image.alt = artwork.title || '';
    image.onerror = function () {
        this.onerror = null;
        this.src = '/images/artwork-placeholder.svg';
    };

    const info = document.createElement('div');
    info.className = 'card__info';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = artwork.title || '제목 없음';

    const subtitle = document.createElement('p');
    subtitle.className = 'card__subtitle';
    subtitle.textContent = artwork.artistName || '작가 미상';

    const meta = document.createElement('p');
    meta.className = 'card__meta';
    meta.textContent = artwork.artistAffiliation;

    imageContainer.appendChild(image);
    info.appendChild(title);
    info.appendChild(subtitle);
    info.appendChild(meta);

    link.appendChild(imageContainer);
    link.appendChild(info);
    card.appendChild(link);

    return card;
}

/**
 * 전시회 캐러셀 카드 생성
 * @param {Object} exhibition - 전시회 데이터
 * @returns {HTMLElement} - 전시회 캐러셀 슬라이드
 */
export function createExhibitionCarouselCard(exhibition) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.dataset.exhibition = exhibition.id || '';

    const card = document.createElement('div');
    card.className = 'card card--carousel card--exhibition';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card__image-container';

    const image = document.createElement('img');
    image.className = 'card__image';
    // imageUrl이 우선, 없으면 image 사용, 둘 다 없으면 기본 이미지
    image.src = exhibition.imageUrl || exhibition.image || '/images/exhibition-placeholder.svg';
    image.alt = exhibition.title || '';
    image.onerror = function () {
        this.onerror = null;
        this.src = '/images/exhibition-placeholder.svg';
    };

    const info = document.createElement('div');
    info.className = 'card__info';

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = exhibition.title || '';

    if (exhibition.subtitle) {
        const subtitle = document.createElement('p');
        subtitle.className = 'card__subtitle';
        subtitle.textContent = exhibition.subtitle;
        info.appendChild(subtitle);
    }

    const meta = document.createElement('div');
    meta.className = 'card__meta';

    // 작품 수 표시 (출품 작품 수가 있는 경우)
    if (exhibition.artworkCount !== undefined) {
        const artworkCount = document.createElement('div');
        artworkCount.innerHTML = `총 <strong>${exhibition.artworkCount || 0}</strong>개의 작품`;
        meta.appendChild(artworkCount);
    }


    imageContainer.appendChild(image);
    info.appendChild(title);
    info.appendChild(meta);

    card.appendChild(imageContainer);
    card.appendChild(info);
    slide.appendChild(card);

    return slide;
}
