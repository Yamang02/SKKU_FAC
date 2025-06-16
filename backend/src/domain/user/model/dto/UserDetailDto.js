/**
 * 사용자 상세 DTO
 * 사용자 상세 정보를 응답 형식에 맞게 변환합니다.
 */
export default class UserDetailDTO {
    constructor(data) {
        this.id = data.id || null;
        this.username = data.username || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.name = data.name || '';
        this.role = data.role || '';
        this.status = data.status || '';
        this.department = data.department || '';
        this.isClubMember = data.isClubMember || false;
        this.studentYear = data.studentYear || '';
        this.skkuUserId = data.skkuUserId || '';
        this.externalUserId = data.externalUserId || '';
        this.affiliation = data.affiliation || '';
        this.createdAt = data.createdAt || '';
        this.updatedAt = data.updatedAt || '';
        this.lastLoginAt = data.lastLoginAt || null;
        this.emailVerified = data.emailVerified || false;
    }
}
