/**
 * 전시회 목록 페이지 - 메인 스크립트
 * 전시회 목록 페이지의 기능을 초기화합니다.
 */
import { initModal } from '../../common/components/modal.js';
import { initGrid } from './grid.js';
import { initFilters } from './filters.js';
import { initSearch } from './search.js';
import { initLoadMore } from './loadMore.js';

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', () => {
    // 모달 초기화
    initModal('exhibition-modal');

    // 그리드 초기화
    initGrid();

    // 필터 초기화
    initFilters();

    // 검색 초기화
    initSearch();

    // 무한 스크롤 초기화
    initLoadMore();

    // 전시회 카드 클릭 이벤트 초기화
    initExhibitionCardEvents();
});

/**
 * 전시회 카드 클릭 이벤트 초기화
 */
function initExhibitionCardEvents() {
    const exhibitionCards = document.querySelectorAll('.exhibition-card');

    exhibitionCards.forEach(card => {
        card.addEventListener('click', () => {
            const exhibitionId = card.dataset.exhibitionId;

            // 전시회 상세 정보 이벤트 발생
            const event = new CustomEvent('exhibition:selected', {
                detail: { exhibitionId }
            });
            document.dispatchEvent(event);

            // 모달 열기
            openExhibitionModal(exhibitionId);
        });
    });
}

/**
 * 전시회 모달 열기
 * @param {string} exhibitionId - 전시회 ID
 */
function openExhibitionModal(exhibitionId) {
    // 모달 컨텐츠 컨테이너
    const modalContentContainer = document.getElementById('modal-content-container');

    // 로딩 표시
    modalContentContainer.innerHTML = `
        <div class="modal-loading">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.25-14.75A.75.75 0 0 1 9 2v1.25a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75z"/>
            </svg>
            <p>전시회 정보를 불러오는 중...</p>
        </div>
    `;

    // 모달 열기
    const modal = document.getElementById('exhibition-modal');
    modal.style.display = 'block';

    // 실제 구현에서는 여기서 API 호출 등을 통해 전시회 정보를 가져옴
    // 현재는 예시 데이터로 대체
    setTimeout(() => {
        // 예시 데이터 (실제 구현에서는 API 응답으로 대체)
        const exhibitionData = {
            id: exhibitionId,
            title: document.querySelector(`.exhibition-card[data-exhibition-id="${exhibitionId}"] .exhibition-title`).textContent.trim(),
            date: document.querySelector(`.exhibition-card[data-exhibition-id="${exhibitionId}"] .exhibition-date`).textContent.trim(),
            image: document.querySelector(`.exhibition-card[data-exhibition-id="${exhibitionId}"] .exhibition-image`).src,
            description: '이 전시회는 현대 미술의 다양한 측면을 탐구하는 작품들을 선보입니다. 국내외 유명 작가들의 작품을 한자리에서 감상할 수 있는 특별한 기회입니다.',
            location: '제1전시관',
            artists: ['김민수', '이지영', '박준호'],
            artworks: [
                { title: '봄의 풍경', medium: '유화', year: '2023' },
                { title: '도시의 밤', medium: '아크릴', year: '2022' },
                { title: '바다의 꿈', medium: '수채화', year: '2023' }
            ]
        };

        // 모달 컨텐츠 업데이트
        modalContentContainer.innerHTML = `
            <div class="exhibition-modal-content">
                <div class="exhibition-modal-header">
                    <h2 class="exhibition-modal-title">${exhibitionData.title}</h2>
                    <p class="exhibition-modal-date">${exhibitionData.date}</p>
                </div>

                <div class="exhibition-modal-body">
                    <div class="exhibition-modal-image">
                        <img src="${exhibitionData.image}" alt="${exhibitionData.title}">
                    </div>

                    <div class="exhibition-modal-info">
                        <div class="info-section">
                            <h3>전시 소개</h3>
                            <p>${exhibitionData.description}</p>
                        </div>

                        <div class="info-section">
                            <h3>전시 장소</h3>
                            <p>${exhibitionData.location}</p>
                        </div>

                        <div class="info-section">
                            <h3>참여 작가</h3>
                            <ul>
                                ${exhibitionData.artists.map(artist => `<li>${artist}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="info-section">
                            <h3>주요 작품</h3>
                            <ul>
                                ${exhibitionData.artworks.map(artwork => `
                                    <li>
                                        <strong>${artwork.title}</strong> (${artwork.year}) - ${artwork.medium}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="exhibition-modal-footer">
                    <button class="btn-primary">전시회 예약</button>
                    <button class="btn-secondary">더 알아보기</button>
                </div>
            </div>
        `;
    }, 1000);
}
