/**
 * 메인 페이지 스크립트
 *
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 */

document.addEventListener('DOMContentLoaded', function () {
    // 서버에서 데이터를 가져오는 대신 현재는 프론트엔드에서 데이터를 관리
    // 실제 구현 시에는 서버에서 데이터를 가져오는 방식으로 변경 필요
    initArtworkModal();
});

/**
 * 작품 모달 기능 초기화
 */
function initArtworkModal() {
    // 임시 데이터 (API가 구현되지 않은 경우 사용)
    const tempArtworkData = {
        1: {
            title: '진주 귀걸이를 한 소녀',
            artist: '요하네스 베르메르',
            department: '서양화과 18학번',
            exhibition: '2024 봄 기획전: 서양미술의 걸작',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'
        },
        2: {
            title: '가나가와 해변의 높은 파도 아래',
            artist: '가쓰시카 호쿠사이',
            department: '동양화과 20학번',
            exhibition: '2024 봄 기획전: 동아시아의 풍경',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg'
        },
        3: {
            title: '자화상',
            artist: '빈센트 반 고흐',
            department: '한문교육과 19학번',
            exhibition: '2024 봄 기획전: 자아와 표현',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg'
        },
        4: {
            title: '세속적 쾌락의 정원',
            artist: '히에로니무스 보스',
            department: '국어국문학과 21학번',
            exhibition: '2024 봄 기획전: 중세의 상상력',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/1200px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg'
        }
    };

    const modal = document.getElementById('artwork-modal');
    const artworkCards = document.querySelectorAll('.card.card--home');
    const closeBtn = document.querySelector('.close');

    if (!modal || !artworkCards.length || !closeBtn) {
        console.error('모달 관련 요소를 찾을 수 없습니다.');
        return;
    }

    // 작품 카드 클릭 이벤트
    artworkCards.forEach(card => {
        card.addEventListener('click', function () {
            const artworkId = this.dataset.artworkId;

            // 작품 ID가 없으면 처리하지 않음
            if (!artworkId) {
                console.error('작품 ID를 찾을 수 없습니다.');
                return;
            }

            // 서버에서 작품 데이터 가져오기
            fetch(`/api/artworks/${artworkId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('작품 데이터를 가져오는데 실패했습니다.');
                    }
                    return response.json();
                })
                .then(artwork => {
                    // 모달 내용 업데이트
                    updateModalContent(modal, artwork, artworkId);

                    // 모달 표시
                    modal.style.display = 'block';

                    // 모달이 표시될 때 body 스크롤 방지
                    document.body.style.overflow = 'hidden';
                })
                .catch(error => {
                    console.error('작품 데이터 로딩 중 오류:', error);

                    // API 오류 시 임시 데이터 사용
                    if (tempArtworkData[artworkId]) {
                        console.log('임시 데이터를 사용합니다.');
                        updateModalContent(modal, tempArtworkData[artworkId], artworkId);
                        modal.style.display = 'block';
                        document.body.style.overflow = 'hidden';
                    } else {
                        // 임시 데이터도 없는 경우 작품 상세 페이지로 이동
                        window.location.href = `/artwork/${artworkId}`;
                    }
                });
        });
    });

    // 닫기 버튼 이벤트
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // ESC 키 누를 때 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal(modal);
        }
    });
}

/**
 * 모달 닫기 함수
 * @param {HTMLElement} modal - 모달 요소
 */
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // body 스크롤 복원
}

/**
 * 모달 내용 업데이트
 * @param {HTMLElement} modal - 모달 요소
 * @param {Object} artwork - 작품 데이터
 * @param {string} artworkId - 작품 ID
 */
function updateModalContent(modal, artwork, artworkId) {
    // 이미지 업데이트
    const modalImage = modal.querySelector('.modal-image');
    if (modalImage) {
        modalImage.src = artwork.image || '';
        modalImage.alt = artwork.title || '작품 이미지';
    }

    // 제목 업데이트
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = artwork.title || '제목 없음';
    }

    // 작가 업데이트
    const modalArtist = modal.querySelector('.modal-artist');
    if (modalArtist) {
        modalArtist.textContent = artwork.artist || '작가 미상';
    }

    // 학과 정보 업데이트
    const modalDepartment = modal.querySelector('.modal-department');
    if (modalDepartment) {
        modalDepartment.textContent = artwork.department || '';
    }

    // 전시회 정보 업데이트
    const exhibitionElement = modal.querySelector('.modal-exhibition');
    if (exhibitionElement) {
        exhibitionElement.textContent = artwork.exhibition || '';
    }

    // 상세 페이지 링크 설정
    const detailLink = modal.querySelector('#detail-link');
    if (detailLink) {
        detailLink.href = `/artwork/${artworkId}`;
    }
}
