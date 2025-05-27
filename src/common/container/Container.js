import { IContainer, LIFECYCLE } from './IContainer.js';

/**
 * @class Container
 * @extends IContainer
 * @description 의존성 주입 컨테이너의 구현 클래스
 */
export class Container extends IContainer {
    constructor() {
        super();

        /**
         * @private
         * @type {Map<string, RegistrationInfo>}
         */
        this._registry = new Map();

        /**
         * @private
         * @type {Set<string>}
         * @description 순환 참조 감지를 위한 해결 중인 의존성 스택
         */
        this._resolutionStack = new Set();
    }

    /**
     * @param {string} key - 등록할 의존성의 키
     * @param {*} implementation - 구현체 (클래스 또는 값)
     * @param {string} [lifecycle='transient'] - 생명주기 ('singleton' 또는 'transient')
     */
    register(key, implementation, lifecycle = LIFECYCLE.TRANSIENT) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }

        if (implementation === undefined || implementation === null) {
            throw new Error('Implementation cannot be null or undefined');
        }

        if (lifecycle !== LIFECYCLE.SINGLETON && lifecycle !== LIFECYCLE.TRANSIENT) {
            throw new Error(`Invalid lifecycle. Must be '${LIFECYCLE.SINGLETON}' or '${LIFECYCLE.TRANSIENT}'`);
        }

        this._registry.set(key, {
            implementation,
            lifecycle,
            instance: null
        });
    }

    /**
     * @param {string} key - 해결할 의존성의 키
     * @returns {*} 해결된 의존성 인스턴스
     */
    resolve(key) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }

        // 순환 참조 감지
        if (this._resolutionStack.has(key)) {
            const stackArray = Array.from(this._resolutionStack);
            throw new Error(`Circular dependency detected: ${stackArray.join(' -> ')} -> ${key}`);
        }

        const registration = this._registry.get(key);
        if (!registration) {
            throw new Error(`No registration found for key: ${key}`);
        }

        // 팩토리 함수로 등록된 경우
        if (registration.factory) {
            // 싱글톤 인스턴스가 이미 생성된 경우 반환
            if (registration.lifecycle === LIFECYCLE.SINGLETON && registration.instance !== null) {
                return registration.instance;
            }

            this._resolutionStack.add(key);
            try {
                const instance = registration.factory(this);

                // 싱글톤인 경우 인스턴스 캐시
                if (registration.lifecycle === LIFECYCLE.SINGLETON) {
                    registration.instance = instance;
                }

                return instance;
            } finally {
                this._resolutionStack.delete(key);
            }
        }

        // 싱글톤 인스턴스가 이미 생성된 경우 반환
        if (registration.lifecycle === LIFECYCLE.SINGLETON && registration.instance !== null) {
            return registration.instance;
        }

        this._resolutionStack.add(key);

        try {
            let instance;

            // 클래스인지 확인
            if (typeof registration.implementation === 'function' &&
                registration.implementation.prototype &&
                registration.implementation.prototype.constructor === registration.implementation) {

                // 클래스의 경우 인스턴스 생성
                instance = new registration.implementation();
            } else {
                // 값 또는 함수의 경우 그대로 반환
                instance = registration.implementation;
            }

            // 싱글톤인 경우 인스턴스 캐시
            if (registration.lifecycle === LIFECYCLE.SINGLETON) {
                registration.instance = instance;
            }

            return instance;
        } finally {
            this._resolutionStack.delete(key);
        }
    }

    /**
     * @param {string} key - 등록할 싱글톤의 키
     * @param {*} implementation - 싱글톤 구현체 (클래스 또는 값)
     */
    registerSingleton(key, implementation) {
        this.register(key, implementation, LIFECYCLE.SINGLETON);
    }

    /**
     * @param {string} key - 등록할 일시적 객체의 키
     * @param {*} implementation - 일시적 객체 구현체 (클래스 또는 값)
     */
    registerTransient(key, implementation) {
        this.register(key, implementation, LIFECYCLE.TRANSIENT);
    }

    /**
     * @param {string} key - 등록할 팩토리의 키
     * @param {Function} factory - 팩토리 함수
     */
    registerFactory(key, factory) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }

        if (typeof factory !== 'function') {
            throw new Error('Factory must be a function');
        }

        this._registry.set(key, {
            implementation: null,
            lifecycle: LIFECYCLE.TRANSIENT,
            instance: null,
            factory
        });
    }

    /**
     * @param {string} key - 확인할 의존성의 키
     * @returns {boolean} 의존성 존재 여부
     */
    has(key) {
        return this._registry.has(key);
    }

    /**
     * @description 컨테이너의 모든 등록된 의존성을 제거
     */
    clear() {
        this._registry.clear();
        this._resolutionStack.clear();
    }

    /**
     * @description 등록된 모든 의존성의 키 목록을 반환
     * @returns {string[]} 등록된 키 목록
     */
    getRegisteredKeys() {
        return Array.from(this._registry.keys());
    }

    /**
     * @description 특정 키의 등록 정보를 반환
     * @param {string} key - 조회할 키
     * @returns {Object|null} 등록 정보 또는 null
     */
    getRegistrationInfo(key) {
        const registration = this._registry.get(key);
        if (!registration) {
            return null;
        }

        return {
            lifecycle: registration.lifecycle,
            hasInstance: registration.instance !== null,
            hasFactory: typeof registration.factory === 'function'
        };
    }

    /**
     * @description 클래스의 static dependencies를 기반으로 자동으로 의존성을 주입하여 인스턴스를 생성
     * @param {Function} ClassConstructor - 생성자 함수 (static dependencies 속성을 가져야 함)
     * @returns {*} 생성된 인스턴스
     */
    autoWire(ClassConstructor) {
        if (typeof ClassConstructor !== 'function') {
            throw new Error('ClassConstructor must be a function');
        }

        // static dependencies 속성 확인
        if (!ClassConstructor.dependencies || !Array.isArray(ClassConstructor.dependencies)) {
            throw new Error('Class must have a static dependencies array property');
        }

        // 의존성 해결
        const resolvedDependencies = this._resolveDependencies(ClassConstructor.dependencies);

        // 의존성이 주입된 인스턴스 생성
        return new ClassConstructor(...resolvedDependencies);
    }

    /**
     * @description 자동 와이어링을 지원하는 클래스를 등록
     * @param {string} key - 등록할 키
     * @param {Function} ClassConstructor - 자동 와이어링 대상 클래스
     * @param {string} [lifecycle='transient'] - 생명주기
     */
    registerAutoWired(key, ClassConstructor, lifecycle = LIFECYCLE.TRANSIENT) {
        if (typeof ClassConstructor !== 'function') {
            throw new Error('ClassConstructor must be a function');
        }

        if (!ClassConstructor.dependencies || !Array.isArray(ClassConstructor.dependencies)) {
            throw new Error('Class must have a static dependencies array property');
        }

        // 팩토리 함수로 등록하여 자동 와이어링 적용
        const factory = (container) => {
            return container.autoWire(ClassConstructor);
        };

        this._registry.set(key, {
            implementation: ClassConstructor,
            lifecycle,
            instance: null,
            factory,
            isAutoWired: true
        });
    }

    /**
     * @private
     * @description 의존성 키 배열을 기반으로 실제 의존성 인스턴스들을 해결
     * @param {string[]} dependencies - 의존성 키 배열
     * @returns {Array} 해결된 의존성 인스턴스 배열
     */
    _resolveDependencies(dependencies) {
        return dependencies.map(dep => {
            if (typeof dep === 'string') {
                return this.resolve(dep);
            } else if (typeof dep === 'object' && dep.key) {
                // 옵션 객체 형태: { key: 'ServiceName', optional: true }
                if (dep.optional && !this.has(dep.key)) {
                    return null;
                }
                return this.resolve(dep.key);
            } else {
                throw new Error(`Invalid dependency format: ${dep}`);
            }
        });
    }

    /**
     * @description 자동 와이어링 지원 여부 확인
     * @param {Function} ClassConstructor - 확인할 클래스
     * @returns {boolean} 자동 와이어링 지원 여부
     */
    canAutoWire(ClassConstructor) {
        return typeof ClassConstructor === 'function' &&
            ClassConstructor.dependencies &&
            Array.isArray(ClassConstructor.dependencies);
    }
}
