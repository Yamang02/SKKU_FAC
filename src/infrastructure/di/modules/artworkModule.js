import ArtworkRepository from '../../repository/ArtworkRepository.js';
import ArtworkService from '../../../domain/artwork/service/ArtworkService.js';
import ArtworkUseCase from '../../../application/artwork/ArtworkUseCase.js';
import ArtworkController from '../../../interface/controller/ArtworkController.js';

export const setupArtworkModule = (container) => {
    const repository = new ArtworkRepository();
    const service = new ArtworkService(repository);
    const exhibitionService = container.get('exhibitionService');
    const useCase = new ArtworkUseCase(service, exhibitionService);
    const controller = new ArtworkController(useCase);

    container.register('artworkRepository', repository);
    container.register('artworkService', service);
    container.register('artworkUseCase', useCase);
    container.register('artworkController', controller);
};
