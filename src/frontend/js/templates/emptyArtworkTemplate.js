// 빈 작품 목록 템플릿
export const emptyArtworkTemplate = `
    <div class="card card--empty" data-artwork-id="">
        <div class="card__link">
            <div class="card__image-container">
                <img src="/images/artwork-placeholder.svg" alt="작품 이미지 없음" class="card__image">
            </div>
            <div class="card__info">
                <h3 class="card__title--empty">작품이 없습니다</h3>
                <p class="card__subtitle--empty">곧 새로운 작품이 전시될 예정입니다.</p>
                <div class="card__meta--empty"></div>
            </div>
        </div>
    </div>
`;

// 에러 메시지 템플릿
export const errorMessageTemplate = `
    <div class="card card--error" data-artwork-id="">
        <div class="card__link">
            <div class="card__image-container card__image-container--error">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
                </svg>
            </div>
            <div class="card__info card__info--error">
                <h3 class="card__title card__title--error">작품 로딩 실패</h3>
                <p class="card__subtitle card__subtitle--error">작품 정보를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        </div>
    </div>
`;

export const loadingSpinnerTemplate = `
    <div class="card card--empty" data-artwork-id="">
        <div class="card__link">
            <div class="card__image-container">
            </div>
            <div class="card__info">
                <h3 class="card__title--empty">로딩 중</h3>
                <p class="card__subtitle--empty">잠시만 기다려 주세요</p>
                <div class="card__meta--empty"></div>
            </div>
        </div>
    </div>
`;
