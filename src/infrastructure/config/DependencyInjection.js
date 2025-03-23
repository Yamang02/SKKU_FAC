import UserController from '../../interface/controllers/user/UserController.js';
import UserUseCase from '../../application/user/UserUseCase.js';
import UserService from '../../domain/user/service/UserService.js';
import UserRepositoryImpl from '../repository/UserRepositoryImpl.js';
import DepartmentRepositoryImpl from '../repository/DepartmentRepositoryImpl.js';
import ArtworkUseCase from '../../application/artwork/ArtworkUseCase.js';
import ArtworkService from '../../domain/artwork/service/ArtworkService.js';
import ArtworkRepositoryImpl from '../repository/ArtworkRepositoryImpl.js';
import CommentUseCase from '../../application/comment/CommentUseCase.js';
import CommentService from '../../domain/comment/service/CommentService.js';
import CommentRepositoryImpl from '../repository/CommentRepositoryImpl.js';
import ExhibitionService from '../../domain/exhibition/service/ExhibitionService.js';
import ExhibitionRepositoryImpl from '../repository/ExhibitionRepositoryImpl.js';

class DependencyInjection {
    constructor() {
        this.instances = new Map();
    }

    getInstance(key) {
        if (!this.instances.has(key)) {
            this.instances.set(key, this.createInstance(key));
        }
        return this.instances.get(key);
    }

    createInstance(key) {
        switch (key) {
        case 'UserController':
            return new UserController(
                this.getInstance('UserUseCase'),
                this.getInstance('ArtworkUseCase'),
                this.getInstance('CommentUseCase')
            );
        case 'UserUseCase':
            return new UserUseCase(this.getInstance('UserService'));
        case 'UserService':
            return new UserService(
                this.getInstance('UserRepository'),
                this.getInstance('DepartmentRepository')
            );
        case 'UserRepository':
            return new UserRepositoryImpl();
        case 'DepartmentRepository':
            return new DepartmentRepositoryImpl();
        case 'ArtworkUseCase':
            return new ArtworkUseCase(
                this.getInstance('ArtworkService'),
                this.getInstance('ExhibitionService')
            );
        case 'ArtworkService':
            return new ArtworkService(this.getInstance('ArtworkRepository'));
        case 'ExhibitionService':
            return new ExhibitionService(this.getInstance('ExhibitionRepository'));
        case 'ArtworkRepository':
            return new ArtworkRepositoryImpl();
        case 'ExhibitionRepository':
            return new ExhibitionRepositoryImpl();
        case 'CommentUseCase':
            return new CommentUseCase(this.getInstance('CommentService'));
        case 'CommentService':
            return new CommentService(this.getInstance('CommentRepository'));
        case 'CommentRepository':
            return new CommentRepositoryImpl();
        default:
            throw new Error(`Unknown dependency: ${key}`);
        }
    }
}

export default new DependencyInjection();
