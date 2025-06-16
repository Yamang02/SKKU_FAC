# 🎨 프론트엔드 개발 가이드라인 (하이브리드 접근)

## 📋 개요

이 프로젝트는 **CSS부터 시작해서 점진적으로 React Native Web으로 전환**하는 하이브리드 접근 방식을 사용합니다. 프론트엔드 초보자도 쉽게 시작할 수 있으면서, 나중에 모바일 앱으로 확장할 수 있는 구조입니다.

## 🎯 왜 이런 접근 방식인가?

### ✅ 장점
- **초보자 친화적**: CSS부터 시작하므로 학습 곡선이 완만함
- **점진적 학습**: 단계별로 React Native Web 기능 도입
- **미래 확장성**: 모바일 앱으로 쉽게 전환 가능
- **유연성**: 상황에 맞는 스타일링 방식 선택

### 🔄 학습 단계

#### **Phase 1: CSS 클래스 사용** (현재 단계)
```jsx
import { View, Text } from 'react-native';
import './AdminPage.css';  // 기존 CSS 파일 사용

const AdminPage = () => (
    <View className="admin-container">
        <Text className="admin-title">관리자 페이지</Text>
    </View>
);
```

#### **Phase 2: CSS + StyleSheet 혼용**
```jsx
import { View, Text, StyleSheet } from 'react-native';
import './AdminPage.css';  // 기존 CSS 유지

const AdminPage = () => (
    <View className="admin-container">
        <Text style={styles.title}>관리자 페이지</Text>  {/* StyleSheet 도입 */}
    </View>
);

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50'
    }
});
```

#### **Phase 3: 완전한 React Native Web**
```jsx
import { View, Text, StyleSheet } from 'react-native';

const AdminPage = () => (
    <View style={styles.container}>
        <Text style={styles.title}>관리자 페이지</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50'
    }
});
```

## 📁 프로젝트 구조

```
frontend/src/
├── styles/                 # CSS 파일들 (Phase 1)
│   ├── global.css         # 전역 스타일 및 CSS 변수
│   ├── components/        # 컴포넌트별 CSS
│   │   ├── button.css
│   │   ├── modal.css
│   │   └── table.css
│   ├── pages/            # 페이지별 CSS
│   │   ├── admin.css
│   │   └── home.css
│   └── utilities/        # 유틸리티 CSS 클래스
├── native-styles/        # React Native Web StyleSheet (Phase 2-3)
├── components/           # React 컴포넌트들
│   ├── Button.jsx       # 하이브리드 버튼 컴포넌트
│   ├── Modal.jsx
│   └── Table.jsx
├── pages/               # 페이지 컴포넌트들
│   ├── admin/
│   └── public/
├── utils/               # 유틸리티 함수들
├── api/                 # API 호출 함수들
└── App.js              # 메인 앱 컴포넌트
```

## 🎨 스타일링 가이드

### 1. CSS 변수 사용 (권장)

```css
/* global.css에서 정의된 변수 사용 */
.my-component {
    color: var(--primary-color);
    padding: var(--spacing-4);
    font-size: var(--font-size-lg);
}
```

### 2. 유틸리티 클래스 활용

```jsx
// Tailwind CSS 스타일의 유틸리티 클래스
<View className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
    <Text className="text-xl font-bold text-primary">제목</Text>
    <Text className="text-gray-600 text-center">설명</Text>
</View>
```

### 3. 컴포넌트별 CSS 파일

```jsx
// Button.jsx
import './button.css';

const Button = ({ title, variant = 'primary' }) => (
    <TouchableOpacity className={`btn btn-${variant}`}>
        <Text className="btn-text">{title}</Text>
    </TouchableOpacity>
);
```

## 🔧 개발 워크플로우

### 1. 새 컴포넌트 만들기

```bash
# 1. 컴포넌트 파일 생성
touch frontend/src/components/MyComponent.jsx

# 2. CSS 파일 생성
touch frontend/src/styles/components/my-component.css

# 3. 컴포넌트에서 CSS 임포트
# import '../styles/components/my-component.css';
```

### 2. 페이지 컴포넌트 만들기

```bash
# 1. 페이지 컴포넌트 생성
touch frontend/src/pages/admin/UserManagement.jsx

# 2. 페이지별 CSS 생성
touch frontend/src/styles/pages/user-management.css
```

### 3. 스타일링 순서

1. **전역 스타일 확인**: `global.css`에서 사용 가능한 CSS 변수와 유틸리티 클래스 확인
2. **유틸리티 클래스 우선 사용**: 간단한 스타일은 유틸리티 클래스로
3. **컴포넌트별 CSS**: 복잡한 스타일은 별도 CSS 파일로
4. **점진적 StyleSheet 도입**: 필요에 따라 React Native Web StyleSheet 사용

## 🚀 모바일 앱 확장 준비

### 현재 코드가 모바일에서 어떻게 작동할까?

```jsx
// 현재 웹 코드
<TouchableOpacity className="btn btn-primary">
    <Text>클릭하세요</Text>
</TouchableOpacity>

// 모바일 앱에서는 자동으로 이렇게 변환됨
<TouchableOpacity style={mobileStyles.button}>
    <Text style={mobileStyles.text}>클릭하세요</Text>
</TouchableOpacity>
```

### 모바일 앱 전환 시 필요한 작업

1. **CSS → StyleSheet 변환**: 자동화 도구 사용
2. **플랫폼별 조건부 스타일**: Platform.OS 활용
3. **네비게이션**: React Navigation으로 교체
4. **API 호출**: 동일한 코드 재사용 가능

## 📝 코딩 규칙

### 1. 파일 명명 규칙

```
컴포넌트: PascalCase (Button.jsx, UserManagement.jsx)
CSS 파일: kebab-case (button.css, user-management.css)
유틸리티: camelCase (apiClient.js, formatDate.js)
```

### 2. CSS 클래스 명명 규칙

```css
/* BEM 방식 권장 */
.btn { }                    /* 블록 */
.btn__text { }              /* 요소 */
.btn--primary { }           /* 수정자 */
.btn--large { }             /* 수정자 */
```

### 3. 컴포넌트 구조

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import './my-component.css';

const MyComponent = ({ title, children, ...props }) => {
    return (
        <View className="my-component" {...props}>
            <Text className="my-component__title">{title}</Text>
            <View className="my-component__content">
                {children}
            </View>
        </View>
    );
};

export default MyComponent;
```

## 🔍 디버깅 팁

### 1. CSS가 적용되지 않을 때

```jsx
// CSS 파일이 제대로 임포트되었는지 확인
import '../styles/components/button.css';

// 클래스명이 정확한지 확인
<View className="btn btn-primary">  {/* ✅ 올바름 */}
<View className="button primary">   {/* ❌ 잘못됨 */}
```

### 2. React Native Web 컴포넌트 사용 시

```jsx
// HTML 태그 대신 React Native Web 컴포넌트 사용
<div>         → <View>
<span>        → <Text>
<button>      → <TouchableOpacity>
<input>       → <TextInput>
```

### 3. 스타일 우선순위

```
1. 인라인 style 속성 (최우선)
2. 컴포넌트별 CSS 파일
3. 전역 CSS (global.css)
4. 유틸리티 클래스
```

## 🎯 다음 단계

1. **현재 (Phase 1)**: CSS 클래스로 Admin 페이지 구현
2. **다음 (Phase 2)**: 일부 컴포넌트에 StyleSheet 도입
3. **미래 (Phase 3)**: 모바일 앱 확장 준비

이 가이드라인을 따르면 프론트엔드 초보자도 쉽게 시작할 수 있으면서, 나중에 모바일 앱으로 확장할 수 있는 견고한 기반을 만들 수 있습니다! 🚀
