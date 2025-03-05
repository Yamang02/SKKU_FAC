/**
 * 메인 페이지 스크립트
 * 
 * 이 파일은 메인 페이지의 모든 인터랙션을 관리합니다.
 * - 작품 모달 기능
 */

document.addEventListener('DOMContentLoaded', function() {
    // 작품 데이터
    const artworkData = {
        1: {
            title: '진주 귀걸이를 한 소녀',
            artist: '요하네스 베르메르',
            department: '서양화과 18학번',
            exhibition: '2024 봄 기획전: 서양미술의 걸작',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg',
            dimensions: {
                width: 800,
                height: 952
            }
        },
        2: {
            title: '가나가와 해변의 높은 파도 아래',
            artist: '가쓰시카 호쿠사이',
            department: '동양화과 20학번',
            exhibition: '2024 봄 기획전: 동아시아의 풍경',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg',
            dimensions: {
                width: 1200,
                height: 815
            }
        },
        3: {
            title: '자화상',
            artist: '빈센트 반 고흐',
            department: '한문교육과 19학번',
            exhibition: '2024 봄 기획전: 자아와 표현',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg',
            dimensions: {
                width: 800,
                height: 971
            }
        },
        4: {
            title: '세속적 쾌락의 정원',
            artist: '히에로니무스 보스',
            department: '국어국문학과 21학번',
            exhibition: '2024 봄 기획전: 중세의 상상력',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/1200px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
            dimensions: {
                width: 1200,
                height: 677
            }
        }
    };

    initArtworkModal(artworkData);
});

/**
 * 작품 모달 기능 초기화
 * @param {Object} artworkData - 작품 데이터 객체
 */
function initArtworkModal(artworkData) {
    const modal = document.getElementById('artwork-modal');
    const artworkCards = document.querySelectorAll('.artwork-card');
    const closeBtn = document.querySelector('.close');
    
    if (!modal || !artworkCards.length || !closeBtn) {
        console.error('모달 관련 요소를 찾을 수 없습니다.');
        return;
    }

    // 작품 카드 클릭 이벤트
    artworkCards.forEach(card => {
        card.addEventListener('click', () => {
            const artworkId = card.dataset.artworkId;
            const artwork = artworkData[artworkId];
            
            if (!artwork) {
                console.error(`ID ${artworkId}에 해당하는 작품 데이터가 없습니다.`);
                return;
            }
            
            // 모달 내용 업데이트
            updateModalContent(modal, artwork, artworkId);
            
            // 모달 표시
            modal.style.display = 'block';
        });
    });

    // 닫기 버튼 이벤트
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * 모달 내용 업데이트
 * @param {HTMLElement} modal - 모달 요소
 * @param {Object} artwork - 작품 데이터
 * @param {string} artworkId - 작품 ID
 */
function updateModalContent(modal, artwork, artworkId) {
    modal.querySelector('.modal-image').src = artwork.image;
    modal.querySelector('.modal-title').textContent = artwork.title;
    modal.querySelector('.modal-artist').textContent = artwork.artist;
    modal.querySelector('.modal-department').textContent = artwork.department;
    modal.querySelector('.modal-exhibition').textContent = artwork.exhibition;
    modal.querySelector('.detail-button').href = `/artwork/${artworkId}`;
}
