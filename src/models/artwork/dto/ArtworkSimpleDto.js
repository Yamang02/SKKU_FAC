import { WebPath } from '../../../constants/Path.js';
import ArtworkRelations from './relations/ArtworkRelations.js';

/**
 * 간단한 작품 정보를 위한 DTO
 */
export default class ArtworkSimpleDTO {
    constructor(artwork, relations = new ArtworkRelations(), type = 'card') {
        this.id = artwork.id;
        this.title = artwork.title;
        this.imageId = artwork.imageId;
        this.image = relations.image ? `${WebPath.UPLOAD.ARTWORKS}/${relations.image.storedName}` : null;
        this.artistName = relations.artist?.name || '';
        this.department = artwork.department;
        this.exhibitionId = artwork.exhibitionId;
        this.exhibitionTitle = relations.exhibition?.title || '';
        this.createdAt = artwork.createdAt;
        this.type = type;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            imageId: this.imageId,
            image: this.image,
            artistName: this.artistName,
            department: this.department,
            exhibitionId: this.exhibitionId,
            exhibitionTitle: this.exhibitionTitle,
            type: this.type
        };
    }
}
