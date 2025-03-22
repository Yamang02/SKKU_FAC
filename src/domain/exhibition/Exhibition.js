export default class Exhibition {
    constructor(
        id,
        title,
        description,
        startDate,
        endDate,
        exhibitionType,
        image = null,
        subtitle = null,
        location = null,
        artists = []
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.exhibitionType = exhibitionType;
        this.image = image;
        this.subtitle = subtitle;
        this.location = location;
        this.artists = artists;
    }

    validate() {
        if (!this.title) {
            throw new Error('Title is required');
        }
        if (!this.startDate) {
            throw new Error('Start date is required');
        }
        if (!this.endDate) {
            throw new Error('End date is required');
        }
        if (this.startDate > this.endDate) {
            throw new Error('Start date must be before end date');
        }
    }
}
