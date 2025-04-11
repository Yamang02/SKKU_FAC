/**
 * 사용자 요청 DTO
 * 사용자 관련 요청 데이터를 검증하고 변환합니다.
 */
export default class UserRequestDto {
    constructor(data) {
        this.id = data.id || null;
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.name = data.name;
        this.role = data.role || 'USER';
        this.department = data.department;
        this.isClubMember = data.isClubMember || false;
        this.studentYear = data.studentYear;
        this.affiliation = data.affiliation;
        this.skkuUserId = data.skkuUserId || null;
        this.externalUserId = data.externalUserId || null;
    }
}
