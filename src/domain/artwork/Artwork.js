export class Artwork {
    constructor(
        id,
        title,
        description,
        imageUrl,
        department,
        year,
        featured = false,
        exhibitionId = null
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.department = department;
        this.year = year;
        this.featured = featured;
        this.exhibitionId = exhibitionId;
    }
}
