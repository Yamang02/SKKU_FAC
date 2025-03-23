/**
 * 학과 정보
 */
export class Department {
    constructor({
        id,
        name,
        code,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

/**
 * 기본 학과 목록
 */
export const DEFAULT_DEPARTMENTS = [
    { id: 1, name: '미술학과', code: 'ART' },
    { id: 2, name: '디자인학과', code: 'DESIGN' },
    { id: 3, name: '공예학과', code: 'CRAFT' },
    { id: 4, name: '조소학과', code: 'SCULPTURE' },
    { id: 5, name: '판화학과', code: 'PRINT' }
].map(dept => new Department(dept));
