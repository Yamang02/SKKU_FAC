import viewResolver from '../../../presentation/util/ViewResolver.js';
import ApplicationError from './ApplicationError.js';

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
const getErrorMessage = (err) => {
    if (err.code === 'ENOENT') return '요청하신 리소스를 찾을 수 없습니다.';
    if (err.code === 'ECONNREFUSED') return '서버에 연결할 수 없습니다.';
    if (err.name === 'ValidationError') return '입력하신 데이터가 유효하지 않습니다.';
    if (err.name === 'TypeError') return '잘못된 데이터 형식입니다.';
    if (err.name === 'ReferenceError') return '존재하지 않는 참조입니다.';
    return err.message || '알 수 없는 오류가 발생했습니다.';
};

/**
 * 이전 페이지 URL 결정
 */
const getReturnUrl = (req) => {
    // 세션에 저장된 이전 페이지가 있으면 사용
    const prevPage = req.session?.previousPage;

    // 관리자 페이지에서 발생한 오류인 경우
    if (req.originalUrl.startsWith('/admin')) {
        return '/admin';
    }

    // 이전 페이지가 있고, 그것이 에러 페이지가 아닌 경우
    if (prevPage && !prevPage.includes('/error')) {
        return prevPage;
    }

    // 기본값으로 메인 페이지
    return '/';
};

/**
 * 전역 에러 처리 미들웨어
 */
export const errorHandler = (err, req, res, _next) => {
    console.error('Error:', err);

    const returnUrl = getReturnUrl(req);
    const isAdminPath = req.originalUrl.startsWith('/admin');

    if (err instanceof ApplicationError) {
        return viewResolver.render(res, 'common/error', {
            title: err.name,
            message: err.message,
            error: {
                ...err,
                stack: process.env.NODE_ENV === 'development' ? err.stack : null
            },
            returnUrl,
            isAdminPath
        });
    }

    // HTTP 상태 코드별 에러 처리
    if (err.status === 401) {
        return viewResolver.render(res, 'common/error', {
            title: '인증 오류',
            message: '로그인이 필요한 서비스입니다.',
            error: {
                ...err,
                stack: process.env.NODE_ENV === 'development' ? err.stack : null
            },
            returnUrl,
            isAdminPath
        });
    }

    if (err.status === 403) {
        return viewResolver.render(res, 'common/error', {
            title: '권한 오류',
            message: '해당 기능에 대한 권한이 없습니다.',
            error: {
                ...err,
                stack: process.env.NODE_ENV === 'development' ? err.stack : null
            },
            returnUrl,
            isAdminPath
        });
    }

    // 예상치 못한 에러
    return viewResolver.render(res, 'common/error', {
        title: '서버 오류',
        message: getErrorMessage(err),
        error: {
            ...err,
            stack: process.env.NODE_ENV === 'development' ? err.stack : null
        },
        returnUrl,
        isAdminPath
    });
};

/**
 * 404 Not Found 에러 처리 미들웨어
 */
export const notFoundHandler = (req, res) => {
    const returnUrl = getReturnUrl(req);
    const isAdminPath = req.originalUrl.startsWith('/admin');

    return viewResolver.render(res, 'common/error', {
        title: 'Page Not Found',
        message: '요청하신 페이지를 찾을 수 없습니다.',
        error: {
            code: 404,
            stack: null
        },
        returnUrl,
        isAdminPath
    });
};
