export const mockUserProfile = {
    name: '작가 이름',
    role: 'SKKU_MEMBER',
    department: '미술학과',
    studentYear: 3,
    affiliation: '서울대학교'
};

export const mockDataFeaturedArtwork = {
    success: true,
    data: {
        artistName: '',
        createdAt: '2025-04-10T03:29:22.352Z',
        exhibitionTitle: '',
        id: 'ARTWORK_09449ab3-c3e0-4055-8e49-b41e70e2f9d0',
        image: '/uploads/artworks/https://res.cloudinary.com/dw57ytzhg/image/upload/v1744255759/artworks/okkt808hhlyn5yulkfdo.jpg',
        slug: '자화상3be90e65',
        title: '자화상',
        type: 'card',
        userId: 'USER_bc0826e9-aa10-4e13-a578-93eef6f58f16'
    },
    error: null,
    timestamp: '2025-04-10T03:29:22.366Z'
};

export const mockDataResponseError = {
    success: false,
    data: null,
    error: '작품 등록에 실패했습니다.',
    timestamp: '2025-04-10T03:29:22.366Z'
};

