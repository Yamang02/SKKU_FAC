export class ArtworkModule {
    constructor() {
        this.artworks = [
            { id: 1, title: 'Artwork 1', artist: 'John Doe', affiliation: 'Studio A', image: '/placeholder.svg?height=400&width=400' },
            { id: 2, title: 'Artwork 2', artist: 'Jane Smith', affiliation: 'Gallery B', image: '/placeholder.svg?height=400&width=400' },
            { id: 3, title: 'Artwork 3', artist: 'Alex Johnson', affiliation: 'Independent', image: '/placeholder.svg?height=400&width=400' },
            { id: 4, title: 'Artwork 4', artist: 'Emily Brown', affiliation: 'Art Collective C', image: '/placeholder.svg?height=400&width=400' },
        ];
        
        this.grid = document.getElementById('artwork-grid');
        this.modal = document.getElementById('artwork-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalArtist = document.getElementById('modal-artist');
        this.modalImage = document.getElementById('modal-image');
        this.closeModal = document.getElementById('close-modal');
        
        this.init();
    }
    
    init() {
        this.renderArtworks();
        this.bindEvents();
    }
    
    renderArtworks() {
        this.artworks.forEach(artwork => {
            const artworkItem = this.createArtworkElement(artwork);
            this.grid.appendChild(artworkItem);
        });
    }
    
    createArtworkElement(artwork) {
        const artworkItem = document.createElement('div');
        artworkItem.classList.add('group', 'relative', 'cursor-pointer');
        
        artworkItem.innerHTML = `
            <div class="relative aspect-square overflow-hidden">
                <img src="${artwork.image}" alt="${artwork.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
            </div>
            <div class="mt-2 flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold">${artwork.title}</h3>
                    <p class="text-sm text-gray-600">${artwork.artist}, ${artwork.affiliation}</p>
                </div>
                <a href="/artwork/${artwork.id}" class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500 hover:text-blue-600">View Details</a>
            </div>
        `;
        
        return artworkItem;
    }
    
    bindEvents() {
        this.grid.addEventListener('click', (e) => {
            const artworkItem = e.target.closest('.group');
            if (artworkItem) {
                const index = Array.from(this.grid.children).indexOf(artworkItem);
                const artwork = this.artworks[index];
                this.openModal(artwork);
            }
        });
        
        this.closeModal.addEventListener('click', () => this.closeModalHandler());
    }
    
    openModal(artwork) {
        this.modalTitle.textContent = artwork.title;
        this.modalArtist.textContent = `${artwork.artist}, ${artwork.affiliation}`;
        this.modalImage.src = artwork.image;
        this.modal.classList.remove('hidden');
    }
    
    closeModalHandler() {
        this.modal.classList.add('hidden');
    }
} 