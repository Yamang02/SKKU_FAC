class Modal {
    constructor() {
        this.modal = document.querySelector('.modal');
        this.closeBtn = document.querySelector('.close');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
    }

    open() {
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.classList.add('modal-open');
            // 애니메이션을 위한 지연
            setTimeout(() => {
                this.modal.classList.add('show');
            }, 10);
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            // 애니메이션 완료 후 display none
            setTimeout(() => {
                this.modal.style.display = 'none';
            }, 300);
        }
    }
}

// 모달 인스턴스 생성
const modal = new Modal();

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.modal.style.display === 'block') {
        modal.close();
    }
});
