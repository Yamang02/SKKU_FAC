import { QRCodeModal } from '../QRcodeModal.js';

/**
 * QR 코드 관련 기능을 제공하는 서비스
 */
export class QRCodeService {
    constructor() {
        this.modal = new QRCodeModal();
    }

    /**
   * 현재 페이지의 QR 코드를 생성하고 모달을 엽니다.
   * @param {Object} data - QR 코드 모달에 표시할 데이터
   */
    async showQRCode(data) {
        await this.modal.open({
            title: data.title,
            subtitle: data.subtitle,
            url: data.url || window.location.href
        });
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default new QRCodeService();
