/**
 * 전시회 목록 페이지 JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 모달 요소
    const modal = document.getElementById('exhibition-modal');
    const closeModal = document.getElementById('close-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalDescription = document.getElementById('modal-description');
    const modalDate = document.getElementById('modal-date');
    const modalArtworksLink = document.getElementById('modal-artworks-link');

    // 전시회 카드 요소들
    const exhibitionCards = document.querySelectorAll('.exhibition-card');

    // 오류 메시지 표시 함수
    const showErrorMessage = (message) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px 20px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.zIndex = '2000';

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 500);
        }, 3000);
    };

    // 전시회 카드 클릭 이벤트 처리
    exhibitionCards.forEach(card => {
        card.addEventListener('click', async () => {
            const exhibitionId = card.dataset.exhibitionId;

            try {
                // 전시회 상세 정보 가져오기
                const response = await fetch(`/api/exhibitions/${exhibitionId}`);

                if (!response.ok) {
                    throw new Error('전시회 정보를 불러오는데 실패했습니다.');
                }

                const exhibition = await response.json();

                // 모달에 전시회 정보 표시
                modalImage.src = exhibition.image;
                modalImage.alt = exhibition.title;
                modalTitle.textContent = exhibition.title;
                modalSubtitle.textContent = exhibition.subtitle || '';
                modalDescription.textContent = exhibition.description;
                modalDate.textContent = `${exhibition.startDate} ~ ${exhibition.endDate}`;
                modalArtworksLink.href = `/exhibitions/${exhibitionId}/artworks`;

                // 모달 표시
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
            } catch (error) {
                console.error('전시회 정보를 불러오는데 오류가 발생했습니다:', error);
                showErrorMessage('전시회 정보를 불러오는데 실패했습니다. 다시 시도해주세요.');
            }
        });
    });

    // 모달 닫기 버튼 클릭 이벤트
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 배경 스크롤 복원
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // ESC 키 누를 때 모달 닫기
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});
