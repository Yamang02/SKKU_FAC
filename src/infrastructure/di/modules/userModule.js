import UserRepositoryImpl from '../../repository/UserRepositoryImpl.js';
import UserService from '../../../domain/user/service/UserService.js';
import UserUseCase from '../../../application/user/UserUseCase.js';
import UserController from '../../../interface/controller/UserController.js';

export const setupUserModule = (container) => {
    const repository = new UserRepositoryImpl();
    const service = new UserService(repository);
    const useCase = new UserUseCase(service);
    const controller = new UserController(useCase);

    container.register('userRepository', repository);
    container.register('userService', service);
    container.register('userUseCase', useCase);
    container.register('userController', controller);
};
