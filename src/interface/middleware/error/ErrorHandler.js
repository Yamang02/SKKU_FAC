import viewResolver from '../../../presentation/view/ViewResolver.js';
import ApplicationError from './ApplicationError.js';

/**
 * 전역 에러 처리 미들웨어
 */
export const errorHandler = (err, req, res, _next) => {
    console.error('Error:', err);

    if (err instanceof ApplicationError) {
        return viewResolver.render(res, 'common/error', {
            title: err.name,
            message: err.message,
            ...err.viewData
        });
    }

    // 예상치 못한 에러
    return viewResolver.render(res, 'common/error', {
        title: '서버 오류',
        message: '예상치 못한 오류가 발생했습니다.'
    });
};

/**
 * 404 Not Found 에러 처리 미들웨어
 */
export const notFoundHandler = (req, res) => {
    return viewResolver.render(res, 'common/error', {
        title: 'Page Not Found',
        message: '요청하신 페이지를 찾을 수 없습니다.'
    });
};
