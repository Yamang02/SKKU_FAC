import ExhibitionRepository from '../../repository/ExhibitionRepository.js';
import ExhibitionService from '../../../domain/exhibition/service/ExhibitionService.js';
import ExhibitionUseCase from '../../../application/exhibition/ExhibitionUseCase.js';
import ExhibitionController from '../../../interface/controller/ExhibitionController.js';

export const setupExhibitionModule = (container) => {
    const repository = new ExhibitionRepository();
    const service = new ExhibitionService(repository);
    const useCase = new ExhibitionUseCase(service);
    const controller = new ExhibitionController(useCase);

    container.register('exhibitionRepository', repository);
    container.register('exhibitionService', service);
    container.register('exhibitionUseCase', useCase);
    container.register('exhibitionController', controller);
};
