/**
 * 웹용 Storage 유틸리티 - TypeScript 버전
 * localStorage를 사용하여 React Native AsyncStorage와 호환되는 인터페이스 제공
 */

const storage = {
    /**
     * 아이템 저장
     * @param key - 저장할 키
     * @param value - 저장할 값
     * @returns Promise<void>
     */
    async setItem(key: string, value: string): Promise<void> {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Storage setItem error:', error);
            throw error;
        }
    },

    /**
     * 아이템 조회
     * @param key - 조회할 키
     * @returns Promise<string|null>
     */
    async getItem(key: string): Promise<string | null> {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    },

    /**
     * 아이템 삭제
     * @param key - 삭제할 키
     * @returns Promise<void>
     */
    async removeItem(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage removeItem error:', error);
            throw error;
        }
    },

    /**
     * 여러 아이템 삭제
     * @param keys - 삭제할 키 배열
     * @returns Promise<void>
     */
    async multiRemove(keys: string[]): Promise<void> {
        try {
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Storage multiRemove error:', error);
            throw error;
        }
    },

    /**
     * 모든 아이템 삭제
     * @returns Promise<void>
     */
    async clear(): Promise<void> {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
            throw error;
        }
    },

    /**
     * 모든 키 조회
     * @returns Promise<string[]>
     */
    async getAllKeys(): Promise<string[]> {
        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('Storage getAllKeys error:', error);
            return [];
        }
    }
};

export default storage;
