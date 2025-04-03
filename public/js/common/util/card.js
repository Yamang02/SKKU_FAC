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
        link.href = `/artwork/${artwork.id}`;
    } else {
        link.role = 'button';
        link.style.cursor = 'pointer';
    }

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card__image-container';

    const image = document.createElement('img');
    image.className = 'card__image';
    image.src = artwork.imageUrl || artwork.image || '/images/artwork-placeholder.svg';
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
    subtitle.textContent = artwork.artist || artwork.artistName || '작가 미상';

    const meta = document.createElement('p');
    meta.className = 'card__meta';
    meta.textContent = artwork.department || '';

    imageContainer.appendChild(image);
    info.appendChild(title);
    info.appendChild(subtitle);
    info.appendChild(meta);

    link.appendChild(imageContainer);
    link.appendChild(info);
    card.appendChild(link);

    return card;
}
