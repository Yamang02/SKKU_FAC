class ViewResolver {
    constructor() {
        this.commonData = {
            siteName: 'SKKU Art Gallery',
            currentYear: new Date().getFullYear()
        };
    }

    /**
     * 뷰를 렌더링합니다.
     * @param {Object} res - Express 응답 객체
     * @param {string} view - 뷰 경로 (예: 'home/HomePage')
     * @param {Object} data - 뷰에 전달할 데이터
     * @param {boolean} useCommonData - 공통 데이터 사용 여부 (기본값: true)
     */
    render(res, view, data = {}, useCommonData = true) {
        // 뷰 경로 생성
        const viewPath = this.resolveViewPath(view);

        // req 객체에서 세션 정보 가져오기
        const user = res.req?.session?.user || null;

        // 데이터 준비
        const renderData = {
            ...useCommonData ? this.commonData : {},
            ...data,
            user // 세션의 user 정보를 모든 뷰에 전달
        };

        // 뷰 렌더링
        return res.render(viewPath, renderData);
    }

    /**
     * 뷰 경로를 해석합니다.
     * @param {string} view - 뷰 경로
     * @returns {string} 실제 뷰 파일 경로
     */
    resolveViewPath(view) {
        // 이미 .ejs로 끝나는 경우 그대로 반환
        if (view.endsWith('.ejs')) {
            return view;
        }
        // 경로에 .ejs를 추가
        return `${view}.ejs`;
    }

    /**
     * 공통 데이터를 추가합니다.
     * @param {Object} data - 추가할 공통 데이터
     */
    addCommonData(data) {
        this.commonData = {
            ...this.commonData,
            ...data
        };
    }
}

export default new ViewResolver();
