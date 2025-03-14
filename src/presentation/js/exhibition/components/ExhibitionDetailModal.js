/**
 * 전시회 상세 모달 컴포넌트
 */

// DOM 요소
const modal = document.getElementById('exhibitionDetailModal');
const closeBtn = document.getElementById('closeExhibitionModal');
const modalImage = document.getElementById('exhibitionModalImage');
const modalTitle = document.getElementById('exhibitionModalTitle');
const modalPeriod = document.getElementById('exhibitionModalPeriod');
const modalDescription = document.getElementById('exhibitionModalDescription');
const modalType = document.getElementById('exhibitionModalType');
const modalViewingHours = document.getElementById('exhibitionModalViewingHours');
const modalLocations = document.getElementById('exhibitionModalLocations');
const artworksButton = document.getElementById('exhibitionModalArtworksButton');

/**
 * 전시회 상세 모달 열기
 * @param {Object} exhibitionData - 전시회 데이터
 */
export function openExhibitionDetailModal(exhibitionData) {
    if (!exhibitionData) {
        return;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 모달 데이터 설정
    modalImage.src = exhibitionData.imageUrl || '/image/exhibition/placeholder-exhibition.svg';
    modalImage.onerror = () => {
        modalImage.src = '/image/exhibition/placeholder-exhibition.svg';
    };

    modalTitle.textContent = exhibitionData.title || '';
    modalPeriod.textContent = `${exhibitionData.startDate || ''} - ${exhibitionData.endDate || ''}`;
    modalDescription.textContent = exhibitionData.description || '';
    modalType.textContent = exhibitionData.type || '';
    modalViewingHours.textContent = exhibitionData.viewingHours || '';

    // 기간별 전시장소 표시
    modalLocations.innerHTML = '';
    if (exhibitionData.locations && exhibitionData.locations.length > 0) {
        exhibitionData.locations.forEach(loc => {
            const locationItem = document.createElement('div');
            locationItem.className = 'location-item';
            locationItem.innerHTML = `
                <span class="location-period">${loc.startDate || ''} - ${loc.endDate || ''}</span>
                <span class="location-name">${loc.name || ''}</span>
            `;
            modalLocations.appendChild(locationItem);
        });
    } else {
        // 기본 전시장소 표시
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.innerHTML = `<span class="location-name">${exhibitionData.location || ''}</span>`;
        modalLocations.appendChild(locationItem);
    }

    // 작품 목록 버튼 URL 설정
    artworksButton.href = '/artwork';

    // 애니메이션 클래스 추가
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

/**
 * 전시회 상세 모달 닫기
 */
export function closeExhibitionDetailModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 이벤트 리스너 등록
closeBtn.addEventListener('click', closeExhibitionDetailModal);

// 모달 외부 클릭 시 닫기
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeExhibitionDetailModal();
    }
});

// ESC 키 누를 때 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeExhibitionDetailModal();
    }
});
