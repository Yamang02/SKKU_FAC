/**
 * 파일 시스템 경로 상수
 */
export const FilePath = {
    // 업로드 관련 경로
    UPLOAD: {
        ROOT: 'public/uploads',
        ARTWORKS: 'public/uploads/artworks',
        EXHIBITIONS: 'public/uploads/exhibitions',
        USERS: 'public/uploads/users'
    },
    // 이미지 관련 경로
    IMAGE: {
        PLACEHOLDER: {
            ARTWORK: '/images/artwork-placeholder.svg',
            EXHIBITION: '/images/exhibition-placeholder.jpg',
            USER: '/images/user-placeholder.jpg'
        }
    }
};

/**
 * 웹 URL 경로 상수
 */
export const WebPath = {
    // 업로드 관련 URL
    UPLOAD: {
        ROOT: '/uploads',
        ARTWORKS: '/uploads/artworks',
        EXHIBITIONS: '/uploads/exhibitions',
        USERS: '/uploads/users'
    }
};
