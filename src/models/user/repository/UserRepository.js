/* eslint-disable no-unused-vars */
/**
 * 사용자 레포지토리 인터페이스
 * @interface
 */
class UserRepository {
    /**
     * ID로 사용자를 찾습니다.
     * @param {number} id - 사용자 ID
     * @returns {Promise<Object>} 사용자 객체
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * 사용자명으로 사용자를 찾습니다.
     * @param {string} username - 사용자명
     * @returns {Promise<Object>} 사용자 객체
     */
    async findByUsername(username) {
        throw new Error('Method not implemented');
    }

    /**
     * 사용자를 저장합니다.
     * @param {Object} userData - 사용자 데이터
     * @returns {Promise<Object>} 저장된 사용자 객체
     */
    async save(userData) {
        throw new Error('Method not implemented');
    }

    /**
     * 사용자 정보를 업데이트합니다.
     * @param {number} id - 사용자 ID
     * @param {Object} userData - 업데이트할 사용자 데이터
     * @returns {Promise<Object>} 업데이트된 사용자 객체
     */
    async update(id, userData) {
        throw new Error('Method not implemented');
    }

    async delete(studentId) {
        throw new Error('Method not implemented');
    }
}

export default UserRepository;
