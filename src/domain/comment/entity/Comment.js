/**
 * 댓글 도메인 엔티티
 */
class Comment {
    constructor(data) {
        this.id = data.id;
        this.artworkId = data.artworkId;
        this.author = data.author;
        this.content = data.content;
        this.date = data.date;
        this.isEditable = data.isEditable || false;
    }
}

export default Comment; 
