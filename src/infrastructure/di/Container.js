/**
 * 의존성 주입 컨테이너
 * 애플리케이션의 모든 의존성을 관리합니다.
 */
export class Container {
    constructor() {
        this.dependencies = new Map();
    }

    /**
     * 의존성을 등록합니다.
     * @param {string} name - 의존성의 이름
     * @param {any} instance - 의존성 인스턴스
     */
    register(name, instance) {
        this.dependencies.set(name, instance);
    }

    /**
     * 등록된 의존성을 가져옵니다.
     * @param {string} name - 의존성의 이름
     * @returns {any} 등록된 의존성 인스턴스
     * @throws {Error} 의존성이 등록되어 있지 않은 경우
     */
    get(name) {
        if (!this.dependencies.has(name)) {
            throw new Error(`의존성 '${name}'이(가) 등록되어 있지 않습니다.`);
        }
        return this.dependencies.get(name);
    }

    /**
     * 특정 의존성이 등록되어 있는지 확인합니다.
     * @param {string} name - 의존성의 이름
     * @returns {boolean} 등록 여부
     */
    has(name) {
        return this.dependencies.has(name);
    }

    /**
     * 등록된 모든 의존성의 이름을 반환합니다.
     * @returns {string[]} 의존성 이름 목록
     */
    getRegisteredDependencies() {
        return Array.from(this.dependencies.keys());
    }
}
