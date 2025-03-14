class ViewResolver {
    constructor() {
        // Express의 views 디렉토리 설정을 따르므로 baseViewPath가 필요 없음
    }

    resolve(viewName) {
        // 상대 경로만 반환
        return viewName;
    }
}

export default new ViewResolver();
