import { Container } from './Container.js';
import UserRepository from '../../infrastructure/db/repository/UserAccountRepository.js';
import AuthService from '../../domain/auth/service/AuthService.js';
import UserService from '../../domain/user/service/UserService.js';
import UserController from '../../domain/user/controller/UserController.js';
import UserApiController from '../../domain/user/controller/api/UserApiController.js';
import logger from '../utils/Logger.js';

/**
 * 서비스 등록 관리 클래스
 * 의존성 주입 컨테이너에 모든 서비스들을 등록합니다.
 */
export class ServiceRegistry {
    constructor() {
        this.container = new Container();
        this.isRegistered = false;
    }

    /**
     * 모든 서비스를 컨테이너에 등록합니다.
     */
    registerServices() {
        if (this.isRegistered) {
            logger.warn('서비스들이 이미 등록되어 있습니다.');
            return this.container;
        }

        try {
            // Repository 등록 (Singleton)
            this.container.registerSingleton('UserAccountRepository', UserRepository);

            // Service 등록 (Singleton)
            this.container.registerSingleton('AuthService', AuthService);
            this.container.registerSingleton('UserService', UserService);

            // Controller 등록 (Transient - 요청마다 새 인스턴스)
            this.container.registerTransient('UserController', UserController);
            this.container.registerTransient('UserApiController', UserApiController);

            this.isRegistered = true;
            logger.success('모든 서비스가 컨테이너에 등록되었습니다.');

            return this.container;
        } catch (error) {
            logger.error('서비스 등록 중 오류 발생:', error);
            throw error;
        }
    }

    /**
     * 컨테이너 인스턴스를 반환합니다.
     */
    getContainer() {
        if (!this.isRegistered) {
            throw new Error('서비스들이 아직 등록되지 않았습니다. registerServices()를 먼저 호출하세요.');
        }
        return this.container;
    }

    /**
     * 특정 서비스를 해결합니다.
     */
    resolve(serviceName) {
        return this.getContainer().resolve(serviceName);
    }

    /**
     * 컨테이너를 초기화합니다.
     */
    clear() {
        this.container.clear();
        this.isRegistered = false;
        logger.info('서비스 컨테이너가 초기화되었습니다.');
    }
}

// 싱글톤 인스턴스 생성
const serviceRegistry = new ServiceRegistry();

export default serviceRegistry;
