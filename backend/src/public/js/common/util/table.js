/**
 * 작품 테이블 행을 생성하는 유틸리티 함수
 * @param {Object} artwork - 작품 데이터 객체
 * @returns {HTMLElement} 생성된 테이블 행 엘리먼트
 */
export function createArtworkTable(artwork) {
    // 디버깅: 테이블 행 생성에 사용되는 데이터 로깅

    const row = document.createElement('tr');
    // 클릭 이벤트 추가
    row.addEventListener('click', () => {
        window.location.href = `/artwork/${artwork.slug || artwork.id}`;
    });

    // 헤더 순서: 이미지, 작품명, 작가, 학과, 전시회, 제작 연도

    // 1. 이미지 셀
    const imageCell = document.createElement('td');
    const imageContainer = document.createElement('div');
    imageContainer.className = 'table-image-container';

    const image = document.createElement('img');
    image.src = artwork.image || artwork.imageUrl || '/images/artwork-placeholder.svg';
    image.alt = artwork.title || '';
    image.className = 'table-image';
    image.loading = 'lazy'; // 이미지 지연 로딩 추가
    image.onerror = function () {
        this.onerror = null;
        this.src = '/images/artwork-placeholder.svg';
    };

    imageContainer.appendChild(image);
    imageCell.appendChild(imageContainer);
    row.appendChild(imageCell);

    // 2. 작품명 셀
    const titleCell = document.createElement('td');
    const titleLink = document.createElement('a');
    titleLink.textContent = artwork.title || '제목 없음';
    titleCell.appendChild(titleLink);
    row.appendChild(titleCell);

    // 3. 작가 셀
    const artistCell = document.createElement('td');
    artistCell.textContent = artwork.artistName || '작가 미상';
    row.appendChild(artistCell);

    // 4. 학과 셀
    const departmentCell = document.createElement('td');
    departmentCell.textContent = artwork.department || artwork.artistAffiliation || '';
    row.appendChild(departmentCell);

    // 5. 전시회 셀
    const exhibitionCell = document.createElement('td');

    // 전시회 타이틀들을 줄바꿈으로 추가
    artwork.exhibitions.forEach(exhibition => {
        const titleDiv = document.createElement('div'); // 각 전시회 타이틀을 감싸는 div 생성
        titleDiv.textContent = exhibition.title; // 전시회 타이틀 설정
        exhibitionCell.appendChild(titleDiv); // 전시회 셀에 추가
    });

    // 만약 전시회가 없다면 '미출품' 텍스트 추가
    if (artwork.exhibitions.length === 0) {
        exhibitionCell.textContent = '미출품';
    }

    row.appendChild(exhibitionCell);

    // 6. 제작연도 셀
    const yearCell = document.createElement('td');
    yearCell.textContent = artwork.year || '-';
    row.appendChild(yearCell);

    return row;
}
