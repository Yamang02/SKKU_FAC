/**
 * 모달 관련 유틸리티
 */

// 모달 초기화
export function initModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 닫기 버튼 이벤트
    const closeButton = modal.querySelector('#close-modal');
    if (closeButton) {
        closeButton.onclick = () => closeModal(modal);
    }

    // 모달 외부 클릭 시 닫기
    modal.onclick = event => {
        if (event.target === modal) {
            closeModal(modal);
        }
    };

    // ESC 키 누를 때 모달 닫기
    const escHandler = e => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// 모달 표시
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 스크롤바 너비 계산
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // body에 modal-open 클래스 추가
    document.body.classList.add('modal-open');

    // 모달 표시
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// 모달 닫기
export function closeModal(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modal) return;

    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, 200);
}

// 모달 내용 업데이트
export function updateModalContent(modalId, content) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    Object.entries(content).forEach(([key, value]) => {
        const element = modal.querySelector(`#${key}`);
        if (element) {
            if (element.tagName === 'IMG') {
                element.src = value;
                element.alt = content.title || '';
            } else if (element.tagName === 'A') {
                element.href = value;
            } else {
                element.textContent = value;
            }
        }
    });
}
