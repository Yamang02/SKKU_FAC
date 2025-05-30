/**
 * 보안 설정
 */

import config from './index.js';

// 기존 코드와의 호환성을 위해 기존 내보내기 유지
// 하지만 내부적으로는 새로운 Config 클래스를 사용

// Content Security Policy 설정
export const cspConfig = config.get('security.csp');

// Rate Limiter 설정
export const rateLimitConfig = config.get('rateLimit');

// 정적 파일 설정
export const staticFileConfig = config.get('security.staticFiles');

// 새로운 방식으로 보안 설정에 접근하는 함수들 제공
export const getSecurityConfig = () => config.get('security');
export const getCspConfig = () => config.get('security.csp');
export const getRateLimitConfig = () => config.get('rateLimit');
export const getStaticFileConfig = () => config.get('security.staticFiles');

// 기본 내보내기로 새로운 config 인스턴스 제공
export default config;
