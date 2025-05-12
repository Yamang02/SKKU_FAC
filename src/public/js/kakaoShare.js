const jsKey = 'd559013a67d0a8e4f0358affeefdbc28';

export function initKakao() {
    if (!window.Kakao || !jsKey) return;
    if (!Kakao.isInitialized()) {
        Kakao.init(jsKey);
    }
}

export function shareArtwork({ title, url, imageUrl }) {
    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: title,
            description: '성미회 작품 감상',
            imageUrl: imageUrl,
            link: {
                webUrl: url,
                mobileWebUrl: url
            }
        }
    });
}
