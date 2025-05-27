/**
 * @fileoverview 의존성 주입 컨테이너 메인 모듈
 * @description 의존성 주입 컨테이너와 관련된 모든 클래스와 상수를 export합니다.
 */

export { Container } from './Container.js';
export { IContainer, LIFECYCLE } from './IContainer.js';

// 기본 컨테이너 인스턴스 생성 및 export
import { Container } from './Container.js';
import { LIFECYCLE } from './IContainer.js';

/**
 * @description 기본 의존성 주입 컨테이너 인스턴스
 * @type {Container}
 */
export const defaultContainer = new Container();

/**
 * @description 컨테이너 팩토리 함수
 * @returns {Container} 새로운 컨테이너 인스턴스
 */
export const createContainer = () => new Container();

/**
 * @description 의존성 주입 컨테이너 사용을 위한 유틸리티 함수들
 */
export const DIContainer = {
    /**
     * @description 새로운 컨테이너 인스턴스 생성
     * @returns {Container}
     */
    create: () => new Container(),

    /**
     * @description 기본 컨테이너 인스턴스 반환
     * @returns {Container}
     */
    getDefault: () => defaultContainer,

    /**
     * @description 라이프사이클 상수
     */
    LIFECYCLE,

    /**
     * @description 클래스가 자동 와이어링을 지원하는지 확인
     * @param {Function} ClassConstructor - 확인할 클래스
     * @returns {boolean}
     */
    canAutoWire: (ClassConstructor) => defaultContainer.canAutoWire(ClassConstructor)
};
