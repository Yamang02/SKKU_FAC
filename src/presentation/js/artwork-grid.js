const artworks = [
    { id: 1, title: 'Artwork 1', artist: 'John Doe', affiliation: 'Studio A', image: '/placeholder.svg?height=400&width=400' },
    { id: 2, title: 'Artwork 2', artist: 'Jane Smith', affiliation: 'Gallery B', image: '/placeholder.svg?height=400&width=400' },
    { id: 3, title: 'Artwork 3', artist: 'Alex Johnson', affiliation: 'Independent', image: '/placeholder.svg?height=400&width=400' },
    { id: 4, title: 'Artwork 4', artist: 'Emily Brown', affiliation: 'Art Collective C', image: '/placeholder.svg?height=400&width=400' }
];

const artworkGrid = document.getElementById('artwork-grid');
const modal = document.getElementById('artwork-modal');
const modalTitle = document.getElementById('modal-title');
const modalArtist = document.getElementById('modal-artist');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');

// 아트워크 리스트 동적 추가
artworks.forEach(artwork => {
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

    // 클릭 시 모달 열기
    artworkItem.addEventListener('click', () => {
        modalTitle.textContent = artwork.title;
        modalArtist.textContent = `${artwork.artist}, ${artwork.affiliation}`;
        modalImage.src = artwork.image;
        modal.classList.remove('hidden');
    });

    artworkGrid.appendChild(artworkItem);
});

// 모달 닫기
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});
