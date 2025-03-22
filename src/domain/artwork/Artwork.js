export class Artwork {
    constructor(
        id,
        title,
        description,
        imageUrl,
        department,
        year,
        featured = false,
        exhibitionId = null,
        artist = null
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.department = department;
        this.year = year;
        this.featured = featured;
        this.exhibitionId = exhibitionId;
        this.artist = artist;

        // EJS 템플릿에 맞게 추가 속성 설정
        this.exhibition_code = exhibitionId;
        this.image = imageUrl;
        this.exhibition = exhibitionId;
    }
}
