/**
 * 전시 목록 페이지 진입점
 */
import { initGrid } from '../../component/exhibition/list/grid.js';
import { initModal } from '../../component/exhibition/list/modal.js';

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    initModal();
});
