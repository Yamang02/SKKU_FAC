// 작품 카드 템플릿 정의
export const artworkCardTemplate = (artwork) => {
    const imageUrl = artwork.relations?.image?.storedName
        ? `/uploads/artworks/${artwork.relations.image.storedName}`
        : '/images/artwork-placeholder.svg';

    return `
    <div class="card" data-artwork-id="${artwork.id}">
        <div class="card__link">
            <div class="card__image-container">
                <img src="${imageUrl}"
                     alt="${artwork.title || ''}"
                     class="card__image"
                     onerror="this.onerror=null; this.src='/images/artwork-placeholder.svg';">
            </div>
            <div class="card__info">
                <h3 class="card__title">${artwork.title || '제목 없음'}</h3>
                <p class="card__subtitle">${artwork.relations?.artist?.name || '작가 미상'}</p>
                <div class="card__meta">${artwork.relations?.artist?.department || ''}</div>
            </div>
        </div>
    </div>
    `;
};
