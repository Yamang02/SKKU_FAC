// Admin 도메인 hooks
// 사용자 관리
export { useAdminUsers } from './useAdminUsers.js';
export { useAdminUser } from './useAdminUser.js';

// Exhibition 관련
export { useExhibitions as useAdminExhibitions } from './useExhibitions.js';
export { useExhibition as useAdminExhibition } from './useExhibition.js';

// Artwork 관련
export { useArtworks as useAdminArtworks } from './useArtworks.js';
export { useArtwork as useAdminArtwork } from './useArtwork.js';

// 향후 Admin 도메인 hooks 확장 예정:
// export { useAdminDashboard } from './useAdminDashboard.js';
// export { useAdminSettings } from './useAdminSettings.js';
// export { useAdminAnalytics } from './useAdminAnalytics.js';
