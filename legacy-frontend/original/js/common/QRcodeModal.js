import { generateQRCodeDataURL } from './util/qrcode.js';
import { showErrorMessage, showSuccessMessage } from './util/notification.js';

/**
 * QR 코드 모달 컴포넌트
 */
export class QRCodeModal {
    constructor() {
        this.modal = document.getElementById('qrCodeModal');
        this.setupEventListeners();
    }

    /**
   * 이벤트 리스너 설정
   */
    setupEventListeners() {
        if (!this.modal) return;

        // 닫기 버튼 이벤트 설정
        const closeButtons = this.modal.querySelectorAll('.close, .close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // 모달 외부 클릭시 닫기
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // esc키 이벤트 설정
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });

        // 다운로드 버튼 이벤트 설정
        const downloadBtn = document.getElementById('downloadQRCode');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const title = document.querySelector('.qr-artwork-title').textContent;
                this.downloadAsImage(title);
            });
        }
    }

    /**
   * QR 코드 모달을 엽니다.
   * @param {Object} data - 모달에 표시할 데이터 (title, subtitle, url)
   */
    async open(data) {
        try {
            if (!this.modal) return;

            // QR 코드 이미지 생성
            const qrCodeDataUrl = await generateQRCodeDataURL(data.url);

            // 모달 내용 업데이트
            document.querySelector('.qr-artwork-title').textContent = data.title || '';
            document.querySelector('.qr-artist-name').textContent = data.subtitle || '';

            const qrCodeImage = document.getElementById('qrCodeImage');
            if (qrCodeImage) {
                qrCodeImage.src = qrCodeDataUrl;
            }

            // 모달 표시
            this.modal.style.display = 'flex';
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('QR 코드 모달 열기 실패:', error);
            showErrorMessage('QR 코드를 생성할 수 없습니다.');
        }
    }

    /**
   * 모달을 닫습니다.
   */
    close() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    /**
   * QR 코드 컨테이너를 이미지로 변환하여 다운로드합니다.
   * @param {string} filename - 파일명에 사용할 텍스트
   */
    async downloadAsImage(filename) {
        try {
            const container = document.getElementById('qrCodeContainer');
            if (!container) return;

            // html2canvas로 DOM 요소를 이미지로 변환
            const html2canvas = window.html2canvas;
            if (!html2canvas) {
                throw new Error('html2canvas 라이브러리를 찾을 수 없습니다.');
            }

            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            // 캔버스를 데이터 URL로 변환
            const dataUrl = canvas.toDataURL('image/png');

            // 다운로드 링크 생성 및 클릭
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${filename}_QR코드.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showSuccessMessage('QR 코드 이미지가 다운로드되었습니다.');
        } catch (error) {
            console.error('QR 코드 이미지 다운로드 실패:', error);
            showErrorMessage('이미지 다운로드에 실패했습니다.');
        }
    }
}
