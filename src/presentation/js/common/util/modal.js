/**
 * 공통 모달 유틸리티 모듈
 * 재사용 가능한 모달 관련 유틸리티 함수들을 제공합니다.
 */
import { fadeIn, fadeOut } from './animation.js';

/**
 * 모달 초기화 함수
 * @param {string} modalId - 모달 요소의 ID
 * @param {string} closeButtonId - 닫기 버튼 요소의 ID
 * @param {Function} closeCallback - 모달 닫기 콜백 함수
 */
export function initModal(modalId, closeButtonId, closeCallback) {
    const modal = document.getElementById(modalId);
    const closeButton = document.getElementById(closeButtonId);

    if (!modal || !closeButton) return;

    // 닫기 버튼 클릭 이벤트
    closeButton.addEventListener('click', () => {
        if (closeCallback) closeCallback();
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (closeCallback) closeCallback();
        }
    });

    // ESC 키 누를 때 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (closeCallback) closeCallback();
        }
    });
}

/**
 * 모달 표시 함수
 * @param {string} modalId - 모달 요소의 ID
 * @param {Function} callback - 완료 후 콜백 함수
 */
export function showModal(modalId, callback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 모달 표시
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    fadeIn(modal, callback);
}

/**
 * 모달 닫기 함수
 * @param {string} modalId - 모달 요소의 ID
 * @param {Function} callback - 완료 후 콜백 함수
 */
export function closeModal(modalId, callback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 모달 닫기
    fadeOut(modal, () => {
        document.body.style.overflow = ''; // 스크롤 복원
        if (callback) callback();
    });
}
