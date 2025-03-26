src/
  ├── views/           # EJS 템플릿 파일들
  │   ├── admin/
  │   ├── artwork/
  │   ├── common/
  │   ├── exhibition/
  │   ├── home/
  │   ├── notice/
  │   └── user/
  │
  ├── public/          # 정적 파일들
  │   ├── css/
  │   ├── js/
  │   └── asset/
  │
  ├── routes/          # 라우팅 로직
  │   ├── admin.js
  │   ├── artwork.js
  │   ├── exhibition.js
  │   ├── home.js
  │   ├── notice.js
  │   └── user.js
  │
  ├── controllers/     # 컨트롤러 로직
  │   ├── adminController.js
  │   ├── artworkController.js
  │   ├── exhibitionController.js
  │   ├── homeController.js
  │   ├── noticeController.js
  │   └── userController.js
  │
  ├── services/        # 비즈니스 로직
  │   ├── adminService.js
  │   ├── artworkService.js
  │   ├── exhibitionService.js
  │   ├── noticeService.js
  │   └── userService.js
  │
  ├── utils/           # 유틸리티 함수들
  │   ├── auth.js
  │   └── helpers.js
  │
  ├── config/          # 설정 파일들
  │   └── database.js
  │
  └── app.js           # 메인 애플리케이션 파일
