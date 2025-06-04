// 메인 JS 엔트리 파일

// CSS 임포트
import './style.css';

// 공통 유틸리티 모듈들
import { showConfirm, showErrorMessage, showSuccessMessage, showLoading } from './js/common/util/notification.js';
import './js/common/util/qrcode.js';
import './js/common/util/url.js';
import './js/common/util/table.js';
import './js/common/util/card.js';

// 공통 컴포넌트들
import './js/common/modal.js';
import './js/common/pagination.js';
import './js/common/filters.js';
import './js/common/QRcodeModal.js';

// API 모듈들 (실제 존재하는 파일들만)
import './js/api/ArtworkApi.js';
import './js/api/ExhibitionApi.js';
import './js/api/UserApi.js';
import './js/api/AuthApi.js';
import './js/api/index.js';

// 관리자 공통 모듈들
import './js/admin/common/LoadingManager.js';

// 전역 함수들을 window 객체에 등록 (기존 코드 호환성을 위해)
window.showConfirm = showConfirm;
window.showErrorMessage = showErrorMessage;
window.showSuccessMessage = showSuccessMessage;
window.showLoading = showLoading;

// 개발 환경에서만 로그 출력
if (import.meta.env.DEV) {
    console.log('🚀 Vite 빌드 시스템이 적용되었습니다!');
    console.log('📦 모든 모듈이 성공적으로 로드되었습니다.');
}

// 페이지별 모듈 동적 로딩을 위한 함수
window.loadPageModule = async (modulePath) => {
    try {
        const module = await import(modulePath);
        console.log(`✅ 페이지 모듈 로드 완료: ${modulePath}`);
        return module;
    } catch (error) {
        console.error(`❌ 페이지 모듈 로드 실패: ${modulePath}`, error);
        throw error;
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM 로드 완료 - 애플리케이션 초기화');

    // 전역 에러 핸들러 설정
    window.addEventListener('error', (event) => {
        console.error('전역 에러 발생:', event.error);
        showErrorMessage('예상치 못한 오류가 발생했습니다.');
    });

    // Promise rejection 핸들러 설정
    window.addEventListener('unhandledrejection', (event) => {
        console.error('처리되지 않은 Promise 거부:', event.reason);
        showErrorMessage('요청 처리 중 오류가 발생했습니다.');
    });
});
