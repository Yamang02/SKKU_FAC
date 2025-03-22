import HomeService from '../../../domain/home/service/HomeService.js';
import HomeUseCase from '../../../application/home/HomeUseCase.js';

export const setupHomeModule = (container) => {
    const artworkRepository = container.get('artworkRepository');
    const noticeService = container.get('noticeService');

    const homeService = new HomeService(artworkRepository);
    const homeUseCase = new HomeUseCase(homeService, noticeService);

    container.register('homeService', homeService);
    container.register('homeUseCase', homeUseCase);
};
