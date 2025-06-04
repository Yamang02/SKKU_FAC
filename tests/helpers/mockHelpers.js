/**
 * 간단한 모킹 헬퍼
 * 복잡한 모킹 시스템 없이 기본적인 모킹 기능 제공
 */

/**
 * 기본 Repository 모킹
 */
export const createMockRepository = (methods = {}) => {
    const defaultMethods = {
        findById: async _id => ({ id: _id, found: true }),
        findAll: async () => [],
        create: async data => ({ id: 1, ...data }),
        update: async (_id, data) => ({ id: _id, ...data }),
        delete: async _id => true,
        findByEmail: async email => ({ id: 1, email }),
        findByUsername: async username => ({ id: 1, username }),
    };

    return {
        ...defaultMethods,
        ...methods,
    };
};

/**
 * 기본 Service 모킹
 */
export const createMockService = (methods = {}) => {
    const defaultMethods = {
        create: async data => ({ id: 1, ...data }),
        findById: async _id => ({ id: _id, found: true }),
        update: async (_id, data) => ({ id: _id, ...data }),
        delete: async _id => true,
        list: async () => [],
    };

    return {
        ...defaultMethods,
        ...methods,
    };
};

/**
 * Auth Service 모킹
 */
export const createMockAuthService = (methods = {}) => {
    const defaultMethods = {
        hashPassword: async _password => `hashed_${_password}`,
        comparePassword: async (_password, _hash) => true,
        generateToken: async user => `token_${user.id}`,
        verifyToken: async _token => ({ id: 1, username: 'test' }),
    };

    return {
        ...defaultMethods,
        ...methods,
    };
};

/**
 * 간단한 스파이 함수 생성
 */
export const createSpy = (returnValue = undefined) => {
    const spy = async (...args) => {
        spy.calls.push(args);
        spy.callCount++;

        if (spy.shouldThrow) {
            throw spy.throwValue;
        }

        return spy.returnValue;
    };

    spy.calls = [];
    spy.callCount = 0;
    spy.returnValue = returnValue;
    spy.shouldThrow = false;
    spy.throwValue = new Error('Mock error');

    // 헬퍼 메서드들
    spy.mockReturnValue = value => {
        spy.returnValue = value;
        return spy;
    };

    spy.mockThrow = error => {
        spy.shouldThrow = true;
        spy.throwValue = error;
        return spy;
    };

    spy.reset = () => {
        spy.calls = [];
        spy.callCount = 0;
        spy.shouldThrow = false;
        return spy;
    };

    return spy;
};

/**
 * 의존성 주입용 모킹 컨테이너
 */
export const createMockContainer = (dependencies = {}) => {
    const container = {
        dependencies: {
            UserAccountRepository: createMockRepository(),
            ArtworkRepository: createMockRepository(),
            ExhibitionRepository: createMockRepository(),
            AuthService: createMockAuthService(),
            ...dependencies,
        },

        get(name) {
            return this.dependencies[name];
        },

        set(name, mock) {
            this.dependencies[name] = mock;
        },
    };

    return container;
};
