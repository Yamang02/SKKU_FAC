/**
 * Main 도메인 API 모듈 Export
 */
export { default as UserApi } from './UserApi.js';
export { default as ArtworkApi } from './ArtworkApi.js';

// 공통 모듈에서 가져오는 API들
export { AuthApi } from '../common/index.js';

// 향후 추가될 Main API들
// export { default as ExhibitionApi } from './ExhibitionApi.js';
// export { default as ReviewApi } from './ReviewApi.js';
// export { default as NotificationApi } from './NotificationApi.js';
