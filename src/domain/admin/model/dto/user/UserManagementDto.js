/**
 * 관리자 페이지용 사용자 DTO
 * 관리자 페이지에서 필요한 사용자 관련 데이터를 제공합니다.
 */
export default class UserManagementDto {
    constructor(data = {}) {
        // 기본 정보
        this.id = data.id || null;
        this.username = data.username || '';
        this.name = data.name || '';
        this.email = data.email || '';
        this.role = data.role || '';
        this.status = data.status || '';

        // 인증 정보
        this.emailVerified = data.emailVerified || false;
        this.lastLoginAt = data.lastLoginAt || null;

        // 시간 정보
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;

        // 회원 유형별 추가 정보
        this.profileInfo = {};

        // 성균관대 회원 정보
        if (data.role === 'SKKU_MEMBER' && data.SkkuUserProfile) {
            this.profileInfo = {
                department: data.SkkuUserProfile.department || '',
                studentYear: data.SkkuUserProfile.studentYear || '',
                isClubMember: data.SkkuUserProfile.isClubMember || false
            };
        }
        // 외부 회원 정보
        else if (data.role === 'EXTERNAL_MEMBER' && data.ExternalUserProfile) {
            this.profileInfo = {
                affiliation: data.ExternalUserProfile.affiliation || ''
            };
        }
    }

    /**
     * 표시용 역할 이름을 반환합니다.
     */
    get roleDisplayName() {
        const roleMap = {
            'ADMIN': '관리자',
            'SKKU_MEMBER': '성균관대 구성원',
            'EXTERNAL_MEMBER': '외부인'
        };
        return roleMap[this.role] || '미분류';
    }

    /**
     * 표시용 상태 이름을 반환합니다.
     */
    get statusDisplayName() {
        const statusMap = {
            'ACTIVE': '활성',
            'INACTIVE': '비활성',
            'BLOCKED': '차단',
            'UNVERIFIED': '미인증'
        };
        return statusMap[this.status] || '미분류';
    }

    /**
     * 이메일 인증 상태를 텍스트로 반환합니다.
     */
    get emailVerifiedText() {
        return this.emailVerified ? '인증 완료' : '미인증';
    }

    /**
     * 프로필 정보를 텍스트로 반환합니다.
     */
    get profileSummary() {
        if (this.role === 'SKKU_MEMBER') {
            let text = this.profileInfo.department || '';
            if (this.profileInfo.studentYear) {
                text += text ? ` (${this.profileInfo.studentYear})` : this.profileInfo.studentYear;
            }
            return text || '-';
        } else if (this.role === 'EXTERNAL_MEMBER') {
            return this.profileInfo.affiliation || '-';
        }
        return '-';
    }

    /**
     * lastLoginAt을 포맷팅하여 반환합니다.
     */
    get lastLoginFormatted() {
        return this.lastLoginAt ? new Date(this.lastLoginAt).toLocaleString() : '없음';
    }

    /**
     * createdAt을 포맷팅하여 반환합니다.
     */
    get createdAtFormatted() {
        return this.createdAt ? new Date(this.createdAt).toLocaleDateString() : '-';
    }

    /**
     * updatedAt을 포맷팅하여 반환합니다.
     */
    get updatedAtFormatted() {
        return this.updatedAt ? new Date(this.updatedAt).toLocaleDateString() : '-';
    }
}
