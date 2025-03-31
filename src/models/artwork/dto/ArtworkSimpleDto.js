/**
 * 간단한 작품 정보를 위한 DTO
 */
export default class ArtworkSimpleDTO {
    constructor(data = {}, type = 'default') {
        this.id = data.id;
        this.title = data.title;
        this.image = data.image;
        this.artistId = data.artistId;
        this.artistName = data.artistName;
        this.department = data.department;
        this.exhibitionId = data.exhibitionId;
        this.exhibitionName = data.exhibitionName;
        this.createdAt = data.createdAt;
        this.type = type;
    }

    toJSON() {
        // 카드 타입일 때
        if (this.type === 'card') {
            return {
                id: this.id,
                title: this.title,
                image: {
                    path: this.image,
                    alt: this.title
                },
                artist: {
                    name: this.artistName,
                    department: this.department
                },
                exhibitionId: this.exhibitionId,
                exhibitionName: this.exhibitionName,
                createdAt: this.createdAt,
                type: this.type
            };
        }

        // 모달 타입일 때
        if (this.type === 'modal') {
            return {
                id: this.id,
                title: this.title,
                imageUrl: this.image,
                artist: this.artistName,
                department: this.department,
                exhibition: this.exhibitionName,
                createdAt: this.createdAt
            };
        }

        // 기본 타입일 때
        return {
            id: this.id,
            title: this.title,
            image: this.image,
            artistId: this.artistId,
            artistName: this.artistName,
            department: this.department,
            exhibitionId: this.exhibitionId,
            exhibitionName: this.exhibitionName,
            createdAt: this.createdAt,
            type: this.type
        };
    }
}
