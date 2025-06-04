/**
 * 로딩 상태 관리 유틸리티
 * 서버 요청 중 사용자 행동 제한 및 로딩 UI 표시
 */
class LoadingManager {
    constructor() {
        this.isLoading = false;
        this.overlay = null;
        this.originalBeforeUnload = null;
        this.init();
    }

    init() {
        this.createOverlay();
        this.setupKeyboardBlocking();
        this.setupPageUnloadDetection();
    }

    /**
     * 로딩 오버레이 HTML 생성
     */
    createOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-text-container">
                    <div class="loading-text">처리 중입니다...</div>
                    <div class="loading-subtext">잠시만 기다려주세요</div>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    /**
     * 로딩 시작
     * @param {string} message - 로딩 메시지
     * @param {string} subMessage - 서브 메시지
     */
    show(message = '처리 중입니다...', subMessage = '잠시만 기다려주세요') {
        if (this.isLoading) return;

        this.isLoading = true;

        // 메시지 업데이트
        const textElement = this.overlay.querySelector('.loading-text');
        const subTextElement = this.overlay.querySelector('.loading-subtext');
        if (textElement) textElement.textContent = message;
        if (subTextElement) subTextElement.textContent = subMessage;

        // 오버레이 표시
        this.overlay.classList.add('active');

        // 페이지 이탈 방지
        this.preventPageUnload();

        // 버튼 및 링크 비활성화
        this.disableInteractiveElements();

        // 키보드 이벤트 차단
        this.blockKeyboardEvents();
    }

    /**
     * 로딩 종료
     */
    hide() {
        if (!this.isLoading) return;

        this.isLoading = false;

        // 오버레이 숨김
        this.overlay.classList.remove('active');

        // 페이지 이탈 방지 해제
        this.allowPageUnload();

        // 버튼 및 링크 활성화
        this.enableInteractiveElements();

        // 키보드 이벤트 차단 해제
        this.unblockKeyboardEvents();
    }

    /**
     * 페이지 이탈 방지
     */
    preventPageUnload() {
        this.originalBeforeUnload = window.onbeforeunload;
        const self = this;
        window.onbeforeunload = function (e) {
            // 로딩 중이 아니면 이탈 방지하지 않음
            if (!self.isLoading) {
                return undefined;
            }
            const message = '현재 작업이 진행 중입니다. 페이지를 떠나시겠습니까?';
            e.returnValue = message;
            return message;
        };
    }

    /**
     * 페이지 이탈 방지 해제
     */
    allowPageUnload() {
        window.onbeforeunload = this.originalBeforeUnload;
    }

    /**
     * 상호작용 요소 비활성화
     */
    disableInteractiveElements() {
        // 모든 버튼 비활성화
        document.querySelectorAll('.admin-button').forEach(button => {
            if (!button.disabled) {
                button.disabled = true;
                button.setAttribute('data-was-enabled', 'true');
            }
        });

        // 모든 링크 비활성화
        document.querySelectorAll('a').forEach(link => {
            if (!link.classList.contains('disabled')) {
                link.classList.add('disabled');
                link.setAttribute('data-was-enabled', 'true');
            }
        });

        // 폼 비활성화
        document.querySelectorAll('form').forEach(form => {
            form.classList.add('form-disabled');
        });
    }

    /**
     * 상호작용 요소 활성화
     */
    enableInteractiveElements() {
        // 버튼 활성화
        document.querySelectorAll('.admin-button[data-was-enabled="true"]').forEach(button => {
            button.disabled = false;
            button.removeAttribute('data-was-enabled');
        });

        // 링크 활성화
        document.querySelectorAll('a[data-was-enabled="true"]').forEach(link => {
            link.classList.remove('disabled');
            link.removeAttribute('data-was-enabled');
        });

        // 폼 활성화
        document.querySelectorAll('form').forEach(form => {
            form.classList.remove('form-disabled');
        });
    }

    /**
     * 키보드 이벤트 차단 설정
     */
    setupKeyboardBlocking() {
        this.keyboardHandler = e => {
            if (!this.isLoading) return;

            // F5, Ctrl+R (새로고침) 차단
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+W (탭 닫기) 차단
            if (e.ctrlKey && e.key === 'w') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Alt+F4 (창 닫기) 차단
            if (e.altKey && e.key === 'F4') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Backspace (뒤로가기) 차단 (입력 필드가 아닌 경우)
            if (
                e.key === 'Backspace' &&
                !['INPUT', 'TEXTAREA'].includes(e.target.tagName) &&
                !e.target.isContentEditable
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
    }

    /**
     * 키보드 이벤트 차단
     */
    blockKeyboardEvents() {
        document.addEventListener('keydown', this.keyboardHandler, true);
    }

    /**
     * 키보드 이벤트 차단 해제
     */
    unblockKeyboardEvents() {
        document.removeEventListener('keydown', this.keyboardHandler, true);
    }

    /**
     * 페이지 언로드 감지 설정
     */
    setupPageUnloadDetection() {
        const self = this;

        // 페이지 가시성 API - 페이지가 숨겨지거나 보여질 때
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // 페이지가 다시 보여질 때 (뒤로가기 등) 로딩 해제
                self.isLoading = false;
                self.hide();
            }
        });

        // 페이지 포커스 이벤트 - 브라우저 탭이 활성화될 때
        window.addEventListener('focus', () => {
            self.isLoading = false;
            self.hide();
        });

        // 페이지가 실제로 언로드되기 시작할 때 로딩 해제
        window.addEventListener('pagehide', () => {
            self.isLoading = false;
        });

        // beforeunload 이벤트에서 로딩 상태 확인 후 해제
        window.addEventListener('beforeunload', () => {
            // 실제 페이지 이탈이 시작되면 로딩 해제
            setTimeout(() => {
                self.isLoading = false;
            }, 100);
        });

        // 페이지 이동 감지 (History API 사용 시)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            self.isLoading = false;
            self.hide();
            return originalPushState.apply(history, arguments);
        };

        history.replaceState = function () {
            self.isLoading = false;
            self.hide();
            return originalReplaceState.apply(history, arguments);
        };

        // popstate 이벤트 (뒤로가기/앞으로가기)
        window.addEventListener('popstate', () => {
            self.isLoading = false;
            self.hide();
        });

        // location.href 변경 감지를 위한 MutationObserver 설정
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                self.isLoading = false;
                self.hide();
            }
        }).observe(document, { subtree: true, childList: true });

        // 페이지 로드 완료 시 로딩 해제
        if (document.readyState === 'complete') {
            self.isLoading = false;
            self.hide();
        } else {
            window.addEventListener('load', () => {
                self.isLoading = false;
                self.hide();
            });
        }
    }

    /**
     * 현재 로딩 상태 반환
     */
    getLoadingState() {
        return this.isLoading;
    }
}

// 전역 인스턴스 생성
window.loadingManager = new LoadingManager();

/**
 * 편의 함수들
 */
window.showLoading = function (message, subMessage) {
    window.loadingManager.show(message, subMessage);
};

window.hideLoading = function () {
    window.loadingManager.hide();
};

window.isLoading = function () {
    return window.loadingManager.getLoadingState();
};

/**
 * 페이지 이동 시 로딩 해제를 보장하는 함수
 */
window.navigateWithLoading = function (url, message = '페이지를 이동하는 중입니다...') {
    window.showLoading(message, '잠시만 기다려주세요');

    // 페이지 이동 전에 로딩 상태를 해제하여 beforeunload 방지
    setTimeout(() => {
        window.loadingManager.isLoading = false;
        window.location.href = url;
    }, 50);
};

/**
 * Fetch 래퍼 함수 - 자동으로 로딩 상태 관리
 */
window.fetchWithLoading = async function (url, options = {}, loadingMessage = '처리 중입니다...') {
    try {
        window.showLoading(loadingMessage);
        const response = await fetch(url, options);
        return response;
    } finally {
        window.hideLoading();
    }
};
