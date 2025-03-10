export class LayoutModule {
    constructor() {
        this.header = document.getElementById('header');
        this.footer = document.getElementById('footer');
        
        this.init();
    }
    
    async init() {
        await this.loadHeader();
        await this.loadFooter();
    }
    
    async loadHeader() {
        try {
            const response = await fetch('/html/header.html');
            const data = await response.text();
            this.header.innerHTML = data;
        } catch (error) {
            // console.error('헤더 로딩 실패:', error);
        }
    }
    
    async loadFooter() {
        try {
            const response = await fetch('/html/footer.html');
            const data = await response.text();
            this.footer.innerHTML = data;
        } catch (error) {
            // console.error('푸터 로딩 실패:', error);
        }
    }
} 
