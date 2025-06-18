/**
 * @abstract
 * @class
 * @description 의존성 주입 컨테이너의 인터페이스 역할을 하는 추상 클래스
 */
export class IContainer {
    /**
     * @abstract
     * @param {string} _key - 등록할 의존성의 키
     * @param {*} _implementation - 구현체 (클래스 또는 값)
     * @param {string} [_lifecycle='transient'] - 생명주기 ('singleton' 또는 'transient')
     */
    register(_key, _implementation, _lifecycle = 'transient') {
        throw new Error('Method not implemented.');
    }

    /**
     * @abstract
     * @param {string} _key - 해결할 의존성의 키
     * @returns {*} 해결된 의존성 인스턴스
     */
    resolve(_key) {
        throw new Error('Method not implemented.');
    }

    /**
     * @abstract
     * @param {string} _key - 등록할 싱글톤의 키
     * @param {*} _implementation - 싱글톤 구현체 (클래스 또는 값)
     */
    registerSingleton(_key, _implementation) {
        throw new Error('Method not implemented.');
    }

    /**
     * @abstract
     * @param {string} _key - 등록할 일시적 객체의 키
     * @param {*} _implementation - 일시적 객체 구현체 (클래스 또는 값)
     */
    registerTransient(_key, _implementation) {
        throw new Error('Method not implemented.');
    }

    /**
     * @abstract
     * @param {string} _key - 등록할 팩토리의 키
     * @param {Function} _factory - 팩토리 함수
     */
    registerFactory(_key, _factory) {
        throw new Error('Method not implemented.');
    }

    /**
     * @abstract
     * @param {string} _key - 확인할 의존성의 키
     * @returns {boolean} 의존성 존재 여부
     */
    has(_key) {
        throw new Error('Method not implemented.');
    }

    /**
     * @abstract
     * @description 컨테이너의 모든 등록된 의존성을 제거
     */
    clear() {
        throw new Error('Method not implemented.');
    }
}

/**
 * @typedef {Object} LifecycleType
 * @property {string} SINGLETON - 싱글톤 라이프사이클
 * @property {string} TRANSIENT - 일시적 라이프사이클
 */
export const LIFECYCLE = {
    SINGLETON: 'singleton',
    TRANSIENT: 'transient'
};

/**
 * @typedef {Object} RegistrationInfo
 * @property {*} implementation - 등록된 구현체
 * @property {string} lifecycle - 생명주기 타입
 * @property {*} [instance] - 캐시된 인스턴스 (싱글톤인 경우)
 * @property {Function} [factory] - 팩토리 함수 (팩토리로 등록된 경우)
 */
