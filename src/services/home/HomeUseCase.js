class HomeUseCase {
    constructor(homeService, noticeService) {
        this.homeService = homeService;
        this.noticeService = noticeService;
    }

    async getHomePageData() {
        const [recentNotices, featuredArtworks] = await Promise.all([
            this.noticeService.getRecentNotices(3),
            this.homeService.getFeaturedArtworks()
        ]);

        return {
            recentNotices,
            featuredArtworks
        };
    }
}

export default HomeUseCase;
