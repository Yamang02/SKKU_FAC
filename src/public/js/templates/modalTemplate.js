/**
 * 공통 모달 템플릿
 */

// 기본 모달 구조
export const modalTemplate = (id, content) => `
    <div id="${id}" class="modal">
        <div class="modal-content">
            <span class="close" id="close-modal">&times;</span>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    </div>
`;

// 작품 모달 내용 템플릿
export const artworkModalContent = `
    <div class="modal-image-container">
        <img id="modal-image" src="" alt="" class="modal-image">
    </div>
    <div class="modal-info">
        <div class="modal-info-content">
            <h2 id="modal-title"></h2>
            <div class="artwork-info-section">
                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </svg>
                    <p id="modal-artist"></p>
                </div>
                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z" />
                        <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z" />
                    </svg>
                    <p id="modal-affiliation"></p>
                </div>
                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132.5.5 0 0 1-.177-.917c.87-.504 1.432-1.168 1.734-1.859.205-.466.315-.913.354-1.297-.04-.0766-.083-.157-.132-.24a3.578 3.578 0 0 1-.366-.543C2.699 10.52 2.389 9.617 2.043 8.09c-.437-1.942-.666-4.543.149-6.226.946-1.994 3.15-2.686 5.042-2.394 1.21.187 2.383.684 3.43 1.284 1.048.6 1.994 1.337 2.771 2.17.895.955 1.584 1.934 2.071 2.909.489.977.764 1.93.764 2.92 0 .312-.027.632-.08.95a.5.5 0 0 1-.98-.195c.04-.242.061-.49.061-.745 0-.782-.22-1.584-.647-2.445-.428-.86-1.044-1.74-1.848-2.608-.714-.762-1.568-1.428-2.523-1.979-.955-.55-1.997-1-3.061-1.166-1.538-.237-3.212.285-3.934 1.843-.682 1.436-.377 3.827.004 5.54.384 1.7.753 2.807 1.048 3.529.15.359.278.638.37.85.116.257.204.486.27.659.192.498.353 1.145.371 1.869.013.482-.099 1.026-.513 1.526-.415.502-1.028.894-1.905 1.182a7.126 7.126 0 0 0 2.554-.153c.59-.147.901-.628 1.075-1.215.087-.293.122-.563.137-.763a6.183 6.183 0 0 0 2.147-1.39c2.239-2.355 5.377-7 6.845-10.286a.5.5 0 0 1 .922.384z" />
                    </svg>
                    <p id="modal-exhibition"></p>
                </div>
            </div>
        </div>
        <a id="modal-link" href="" class="modal-detail-link">자세히 보기</a>
    </div>
`;

// 전시회 모달 내용 템플릿
export const exhibitionModalContent = `
    <div class="row g-0">
      <div class="col-md-6 mb-3 mb-md-0">
        <img src="" alt="" class="exhibition-modal-image">
      </div>
      <div class="col-md-6">
        <h2 class="exhibition-modal-title"></h2>
        <div class="exhibition-badges mb-3">
          <!-- Badges will be dynamically added here -->
        </div>
        <p class="mb-4"></p>
        <div class="d-flex align-items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#072B61" class="bi bi-calendar-event me-2" viewBox="0 0 16 16">
            <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
          <span></span>
        </div>
        <div class="d-flex align-items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#072B61" class="bi bi-geo-alt me-2" viewBox="0 0 16 16">
            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
          <span></span>
        </div>
        <div class="d-flex flex-column flex-md-row gap-2">
          <button class="btn btn-primary view-artwork-btn" data-exhibition-id="">
            작품 보기
          </button>
          <!-- Submission button will be dynamically added here -->
        </div>
      </div>
    </div>
`;
