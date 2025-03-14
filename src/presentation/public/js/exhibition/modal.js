// 모달 관련 DOM 요소
const modal = document.getElementById('exhibitionModal');
const closeBtn = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPeriod = document.getElementById('modalPeriod');
const modalLocation = document.getElementById('modalLocation');
const modalDescription = document.getElementById('modalDescription');
const modalType = document.getElementById('modalType');
const modalArtists = document.getElementById('modalArtists');
const modalViewingHours = document.getElementById('modalViewingHours');
const modalAdmission = document.getElementById('modalAdmission');
const shareButton = document.getElementById('shareButton');

// 모달 열기 함수
export function openModal(exhibitionData) {
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
    modalLocation.textContent = exhibitionData.location || '';
    modalDescription.textContent = exhibitionData.description || '';
    modalType.textContent = exhibitionData.type || '';
    modalArtists.textContent = exhibitionData.artists ? exhibitionData.artists.join(', ') : '';
    modalViewingHours.textContent = exhibitionData.viewingHours || '';
    modalAdmission.textContent = exhibitionData.admission || '';

    // 애니메이션 클래스 추가
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// 모달 닫기 함수
export function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 이벤트 리스너 등록
closeBtn.addEventListener('click', closeModal);

// 모달 외부 클릭 시 닫기
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// ESC 키 누를 때 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// 공유하기 버튼 클릭 이벤트
shareButton.addEventListener('click', async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: modalTitle.textContent,
                text: modalDescription.textContent,
                url: window.location.href
            });
        } else {
            // 공유 API를 지원하지 않는 경우 클립보드에 URL 복사
            await navigator.clipboard.writeText(window.location.href);
            // 복사 성공 메시지를 표시할 요소 생성
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = 'URL이 클립보드에 복사되었습니다.';
            document.body.appendChild(notification);

            // 3초 후 알림 제거
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    } catch (error) {
        // 에러 처리는 조용히 실패
    }
});
