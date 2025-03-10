# 컴포넌트 사용 가이드

## 작품 카드 컴포넌트

작품 카드 컴포넌트는 작품 목록, 관련 작품, 전시회 작품 등 다양한 페이지에서 재사용되는 UI 요소입니다.

### 기본 사용법

```html
<div class="card card--[context]">
    <img src="/path/to/image.jpg" alt="작품 제목" class="card__image">
    <div class="card__info">
        <h3 class="card__title">작품 제목</h3>
        <p class="card__subtitle">작가 이름</p>
        <div class="card__meta">추가 정보</div>
    </div>
</div>
```

### 컨텍스트별 사용 예시

#### 1. 홈 페이지

```html
<div class="card card--home">
    <img src="/path/to/image.jpg" alt="작품 제목" class="card__image">
    <div class="card__info">
        <h3 class="card__title">작품 제목</h3>
        <p class="card__subtitle">작가 이름</p>
    </div>
</div>
```

#### 2. 작품 상세 페이지 (관련 작품)

```html
<div class="card card--related">
    <img src="/path/to/image.jpg" alt="작품 제목" class="card__image">
    <div class="card__info">
        <h3 class="card__title">작품 제목</h3>
        <p class="card__subtitle">작가 이름</p>
    </div>
</div>
```

#### 3. 전시회 페이지

```html
<div class="card card--exhibition">
    <img src="/path/to/image.jpg" alt="작품 제목" class="card__image">
    <div class="card__info">
        <h3 class="card__title">작품 제목</h3>
        <p class="card__subtitle">작가 이름</p>
        <div class="card__meta">전시 기간: 2023.01.01 - 2023.12.31</div>
    </div>
</div>
```

#### 4. 작품 목록 페이지

```html
<div class="card card--list">
    <a href="/artwork/123" class="card__link">
        <div class="card__image-container">
            <img src="/path/to/image.jpg" alt="작품 제목" class="card__image">
        </div>
        <div class="card__info">
            <h3 class="card__title">작품 제목</h3>
            <p class="card__subtitle">작가 이름</p>
        </div>
    </a>
</div>
```

### 레거시 클래스 지원

기존 코드와의 호환성을 위해 레거시 클래스도 지원합니다. 그러나 새로운 개발에서는 BEM 방식의 클래스 사용을 권장합니다.

```html
<!-- 홈 페이지 (레거시) -->
<div class="artwork-card">
    <img src="/path/to/image.jpg" alt="작품 제목" class="artwork-image">
    <div class="artwork-info">
        <h3 class="artwork-title">작품 제목</h3>
        <p class="artwork-artist">작가 이름</p>
    </div>
</div>

<!-- 관련 작품 (레거시) -->
<div class="related-artwork-card">
    <img src="/path/to/image.jpg" alt="작품 제목" class="related-artwork-image">
    <div class="related-artwork-info">
        <h3 class="related-artwork-title">작품 제목</h3>
        <p class="related-artwork-artist">작가 이름</p>
    </div>
</div>
```

### 이미지 플레이스홀더

이미지가 로드되지 않거나 없는 경우 플레이스홀더를 사용할 수 있습니다.

```html
<div class="card card--home">
    <div class="card__image-placeholder"></div>
    <div class="card__info">
        <h3 class="card__title">작품 제목</h3>
        <p class="card__subtitle">작가 이름</p>
    </div>
</div>
```
