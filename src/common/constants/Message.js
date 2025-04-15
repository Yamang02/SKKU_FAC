/**
 * API 응답 메시지 상수
 */
export const Message = {
    // 공통 메시지
    COMMON: {
        SUCCESS: '요청이 성공적으로 처리되었습니다.',
        SERVER_ERROR: '서버 오류가 발생했습니다.',
        VALIDATION_ERROR: '입력값이 유효하지 않습니다.',
        NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
        UNAUTHORIZED: '인증이 필요합니다.',
        FORBIDDEN: '접근 권한이 없습니다.'
    },

    // 작품 관련 메시지
    ARTWORK: {
        CREATE_SUCCESS: '작품이 성공적으로 등록되었습니다.',
        UPDATE_SUCCESS: '작품이 성공적으로 수정되었습니다.',
        DELETE_SUCCESS: '작품이 성공적으로 삭제되었습니다.',
        NOT_FOUND: '작품을 찾을 수 없습니다.',
        VALIDATION_ERROR: '작품 정보가 유효하지 않습니다.',
        CREATE_ERROR: '작품 등록 중 오류가 발생했습니다.',
        UPDATE_ERROR: '작품 수정 중 오류가 발생했습니다.',
        DELETE_ERROR: '작품 삭제 중 오류가 발생했습니다.',
        SUBMIT_SUCCESS: '작품이 성공적으로 출품되었습니다.',
        SUBMIT_ERROR: '작품 출품 중 오류가 발생했습니다.',
        CANCEL_SUCCESS: '작품 출품이 성공적으로 취소되었습니다.',
        CANCEL_ERROR: '작품 출품 취소 중 오류가 발생했습니다.'
    },

    // 이미지 관련 메시지
    IMAGE: {
        UPLOAD_SUCCESS: '이미지가 성공적으로 업로드되었습니다.',
        DELETE_SUCCESS: '이미지가 성공적으로 삭제되었습니다.',
        UPLOAD_ERROR: '이미지 업로드 중 오류가 발생했습니다.',
        DELETE_ERROR: '이미지 삭제 중 오류가 발생했습니다.',
        VALIDATION_ERROR: '이미지 파일이 유효하지 않습니다.',
        NOT_FOUND: '이미지를 찾을 수 없습니다.',
        SIZE_LIMIT: '이미지 크기가 제한을 초과했습니다.',
        TYPE_ERROR: '지원하지 않는 이미지 형식입니다.'
    },

    // 전시 관련 메시지
    EXHIBITION: {
        CREATE_SUCCESS: '전시가 성공적으로 등록되었습니다.',
        UPDATE_SUCCESS: '전시가 성공적으로 수정되었습니다.',
        DELETE_SUCCESS: '전시가 성공적으로 삭제되었습니다.',
        NOT_FOUND: '전시를 찾을 수 없습니다.',
        VALIDATION_ERROR: '전시 정보가 유효하지 않습니다.',
        CREATE_ERROR: '전시 등록 중 오류가 발생했습니다.',
        UPDATE_ERROR: '전시 수정 중 오류가 발생했습니다.',
        DELETE_ERROR: '전시 삭제 중 오류가 발생했습니다.'
    },

    // 사용자 관련 메시지
    USER: {
        LOGIN_SUCCESS: '로그인이 성공적으로 완료되었습니다.',
        LOGIN_ERROR: '아이디와 비밀번호를 확인해주세요.',
        LOGOUT_SUCCESS: '로그아웃이 성공적으로 완료되었습니다.',
        REGISTER_SUCCESS: '회원가입이 성공적으로 완료되었습니다. 이메일 인증 메일을 확인해주세요.',
        NOT_FOUND: '사용자를 찾을 수 없습니다.',
        VALIDATION_ERROR: '사용자 정보가 유효하지 않습니다.',
        AUTH_ERROR: '인증에 실패했습니다.',
        DUPLICATE_ERROR: '이미 존재하는 사용자입니다.',
        DUPLICATE_USERNAME_ERROR: '이미 존재하는 아이디입니다.',
        DUPLICATE_EMAIL_ERROR: '이미 존재하는 이메일입니다.',
        RESET_PASSWORD_ERROR: '비밀번호 재설정 중 오류가 발생했습니다.'
    }
};
