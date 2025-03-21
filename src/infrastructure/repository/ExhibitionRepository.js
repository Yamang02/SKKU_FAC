import Exhibition from '../../domain/exhibition/Exhibition.js';

export default class ExhibitionRepository {
    constructor() {
        this.exhibitions = [];
    }

    async findAll() {
        return this.exhibitions;
    }

    async findById(id) {
        return this.exhibitions.find(exhibition => exhibition.id === id);
    }

    async findByCategory(category) {
        return this.exhibitions.filter(exhibition => exhibition.category === category);
    }

    async create(exhibitionData) {
        const exhibition = new Exhibition(
            this.exhibitions.length + 1,
            exhibitionData.title,
            exhibitionData.description,
            exhibitionData.startDate,
            exhibitionData.endDate,
            exhibitionData.category,
            exhibitionData.thumbnail
        );
        this.exhibitions.push(exhibition);
        return exhibition;
    }

    async update(id, exhibitionData) {
        const index = this.exhibitions.findIndex(exhibition => exhibition.id === id);
        if (index === -1) return null;

        const exhibition = this.exhibitions[index];
        Object.assign(exhibition, exhibitionData);
        return exhibition;
    }

    async delete(id) {
        const index = this.exhibitions.findIndex(exhibition => exhibition.id === id);
        if (index === -1) return false;

        this.exhibitions.splice(index, 1);
        return true;
    }
}
