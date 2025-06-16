import { Container } from './Container.js';
import UserRepository from '../../infrastructure/db/repository/UserAccountRepository.js';
import TokenRepository from '../../infrastructure/db/repository/TokenRepository.js';
import ArtworkRepository from '../../infrastructure/db/repository/ArtworkRepository.js';
import ArtworkExhibitionRelationshipRepository from '../../infrastructure/db/repository/relationship/ArtworkExhibitionRelationshipRepository.js';
import ExhibitionRepository from '../../infrastructure/db/repository/ExhibitionRepository.js';
import AuthService from '../../domain/auth/service/AuthService.js';
import UserService from '../../domain/user/service/UserService.js';
import ArtworkService from '../../domain/artwork/service/ArtworkService.js';
import ImageService from '../../domain/image/service/ImageService.js';
import ExhibitionService from '../../domain/exhibition/service/ExhibitionService.js';
import SystemManagementService from '../../domain/admin/service/system/SystemManagementService.js';
import UserAdminService from '../../domain/user/admin/service/UserAdminService.js';
import ExhibitionAdminService from '#domain/exhibition/admin/service/ExhibitionAdminService.js';
import ArtworkAdminService from '#domain/artwork/admin/service/ArtworkAdminService.js';
import BatchProcessingService from '../service/BatchProcessingService.js';
import UserController from '../../domain/user/controller/UserController.js';
import UserApiController from '../../domain/user/controller/api/UserApiController.js';
import ArtworkController from '../../domain/artwork/controller/ArtworkController.js';
import SystemManagementController from '../../domain/admin/controller/system/SystemManagementController.js';
import UserAdminController from '../../domain/user/admin/controller/UserAdminController.js';
import ExhibitionAdminController from '#domain/exhibition/admin/controller/ExhibitionAdminController.js';
import ArtworkAdminController from '#domain/artwork/admin/controller/ArtworkAdminController.js';
import UserAdminApiController from '#domain/user/controller/api/UserAdminApiController.js';
import ArtworkAdminApiController from '#domain/artwork/controller/api/ArtworkAdminApiController.js';
import ExhibitionAdminApiController from '#domain/exhibition/controller/api/ExhibitionAdminApiController.js';
import BatchController from '../../domain/admin/controller/BatchController.js';
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
            this.container.registerSingleton('tokenRepository', TokenRepository);
            this.container.registerSingleton('userRepository', UserRepository);
            this.container.registerSingleton('ArtworkRepository', ArtworkRepository);
            this.container.registerSingleton(
                'ArtworkExhibitionRelationshipRepository',
                ArtworkExhibitionRelationshipRepository
            );
            this.container.registerSingleton('ExhibitionRepository', ExhibitionRepository);

            // Service 등록 (의존성 없는 서비스는 일반 Singleton)
            this.container.registerSingleton('ImageService', ImageService);

            // Service 등록 (AutoWired Singleton - 의존성 자동 주입)
            this.container.registerAutoWired('AuthService', AuthService, 'singleton');
            this.container.registerAutoWired('UserService', UserService, 'singleton');
            this.container.registerAutoWired('ExhibitionService', ExhibitionService, 'singleton');
            this.container.registerAutoWired('ArtworkService', ArtworkService, 'singleton');
            this.container.registerAutoWired('SystemManagementService', SystemManagementService, 'singleton');
            this.container.registerAutoWired('UserAdminService', UserAdminService, 'singleton');
            this.container.registerAutoWired('ExhibitionAdminService', ExhibitionAdminService, 'singleton');
            this.container.registerAutoWired('ArtworkAdminService', ArtworkAdminService, 'singleton');

            // 배치 처리 서비스 - 컨테이너 자체를 주입
            this.container.register(
                'BatchProcessingService',
                () => {
                    const batchService = new BatchProcessingService();
                    batchService.setContainer(this.container);
                    return batchService;
                },
                'singleton'
            );

            // Controller 등록 (AutoWired Transient - 요청마다 새 인스턴스)
            this.container.registerAutoWired('UserController', UserController, 'transient');
            this.container.registerAutoWired('UserApiController', UserApiController, 'transient');
            this.container.registerAutoWired('ArtworkController', ArtworkController, 'transient');
            this.container.registerAutoWired('SystemManagementController', SystemManagementController, 'transient');
            this.container.registerAutoWired('UserAdminController', UserAdminController, 'transient');
            this.container.registerAutoWired(
                'ExhibitionAdminController',
                ExhibitionAdminController,
                'transient'
            );
            this.container.registerAutoWired('ArtworkAdminController', ArtworkAdminController, 'transient');
            this.container.registerAutoWired('UserAdminApiController', UserAdminApiController, 'transient');
            this.container.registerAutoWired('ArtworkAdminApiController', ArtworkAdminApiController, 'transient');
            this.container.registerAutoWired('ExhibitionAdminApiController', ExhibitionAdminApiController, 'transient');
            this.container.registerAutoWired('BatchController', BatchController, 'transient');

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
