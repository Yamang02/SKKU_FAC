class UserDomainService {
    /**
     * 비밀번호의 유효성을 검증합니다.
     * @param {string} password - 검증할 비밀번호
     * @returns {boolean} 유효성 여부
     */
    validatePassword(password) {
        if (!password) return false;
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;  // 대문자 포함
        if (!/[a-z]/.test(password)) return false;  // 소문자 포함
        if (!/[0-9]/.test(password)) return false;  // 숫자 포함
        if (!/[!@#$%^&*]/.test(password)) return false;  // 특수문자 포함
        return true;
    }

    /**
     * 학번의 유효성을 검증합니다.
     * @param {string} studentId - 검증할 학번
     * @returns {boolean} 유효성 여부
     */
    validateStudentId(studentId) {
        if (!studentId) return false;
        // 학번 형식: 2자리 연도 + 7자리 숫자
        return /^\d{9}$/.test(studentId);
    }

    /**
     * 이메일의 유효성을 검증합니다.
     * @param {string} email - 검증할 이메일
     * @returns {boolean} 유효성 여부
     */
    validateEmail(email) {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * 작가 정보의 유효성을 검증합니다.
     * @param {Object} artistInfo - 검증할 작가 정보
     * @returns {boolean} 유효성 여부
     */
    validateArtistInfo(artistInfo) {
        if (!artistInfo) return false;
        if (!artistInfo.biography || typeof artistInfo.biography !== 'string') return false;
        if (!artistInfo.specialty || typeof artistInfo.specialty !== 'string') return false;
        return true;
    }
}

export default UserDomainService;
