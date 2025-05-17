/**
 * 사용자 간단 정보 DTO
 * 사용자의 간단한 정보를 응답 형식에 맞게 변환합니다.
 */
export default class UserSimpleDTO {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.name = data.name;
        this.role = data.role;
        this.affiliation = data.affiliation;
    }
}
