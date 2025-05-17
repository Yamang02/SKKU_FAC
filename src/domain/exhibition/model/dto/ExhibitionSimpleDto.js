/**
 * 간단한 전시회 정보를 위한 DTO
 */

import CloudinaryUrlOptimizer from '../../../../common/utils/CloudinaryUrlOptimizer.js';

export default class ExhibitionSimpleDto {
    constructor(exhibition) {
        if (!exhibition) {
            this.id = null;
            return;
        }
        this.id = exhibition.id;
        this.title = exhibition.title;
        this.isFeatured = exhibition.isFeatured;
        this.imageUrl = exhibition.imageUrl ? CloudinaryUrlOptimizer.optimizeImageUrl(exhibition.imageUrl) : '';
        this.isSubmissionOpen = exhibition.isSubmissionOpen === true;
        this.startDate = exhibition.startDate;
        this.endDate = exhibition.endDate;
    }
}
