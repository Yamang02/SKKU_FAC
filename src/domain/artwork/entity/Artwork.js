/**
 * 작품 도메인 엔티티
 */
class Artwork {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.artist = data.artist;
        this.department = data.department;
        this.year = data.year;
        this.medium = data.medium;
        this.size = data.size;
        this.description = data.description;
        this.exhibitionId = data.exhibitionId;
        this.image = data.image;
    }
}

module.exports = Artwork; 