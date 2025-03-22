import NoticeRepositoryImpl from '../../repository/NoticeRepositoryImpl.js';
import CommentRepositoryImpl from '../../repository/CommentRepositoryImpl.js';
import NoticeService from '../../../domain/notice/service/NoticeService.js';
import CommentService from '../../../domain/comment/service/CommentService.js';
import NoticeUseCase from '../../../application/notice/NoticeUseCase.js';
import NoticeController from '../../../interface/controller/NoticeController.js';

export const setupNoticeModule = (container) => {
    const noticeRepository = new NoticeRepositoryImpl();
    const commentRepository = new CommentRepositoryImpl();

    const noticeService = new NoticeService(noticeRepository);
    const commentService = new CommentService(commentRepository);

    const useCase = new NoticeUseCase(noticeService, commentService);
    const controller = new NoticeController(useCase);

    container.register('noticeRepository', noticeRepository);
    container.register('commentRepository', commentRepository);
    container.register('noticeService', noticeService);
    container.register('commentService', commentService);
    container.register('noticeUseCase', useCase);
    container.register('noticeController', controller);
};
