# 🎨 하이브리드 스타일링 가이드

## 📋 개요
이 프로젝트는 **CSS부터 시작해서 점진적으로 React Native Web StyleSheet로 전환**하는 하이브리드 접근 방식을 사용합니다.

## 🔄 학습 단계

### Phase 1: CSS 클래스 사용 (초보자 친화적)
```javascript
import { View, Text } from 'react-native';
import './AdminPage.css';  // 기존 CSS 파일 사용

const AdminPage = () => (
    <View className="admin-container">
        <Text className="admin-title">관리자 페이지</Text>
    </View>
);
```

### Phase 2: CSS + StyleSheet 혼용
```javascript
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

### Phase 3: 완전한 React Native Web StyleSheet
```javascript
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

## 📁 폴더 구조

```
src/
├── styles/                 # CSS 파일들 (Phase 1)
│   ├── components/         # 컴포넌트별 CSS
│   ├── pages/             # 페이지별 CSS
│   ├── utilities/         # 유틸리티 CSS 클래스
│   └── global.css         # 전역 스타일
├── native-styles/         # React Native Web StyleSheet (Phase 2-3)
├── components/            # React 컴포넌트들
└── pages/                # 페이지 컴포넌트들
```

## 🎯 언제 어떤 방식을 사용할까?

### CSS 클래스 사용 시기:
- ✅ 프로젝트 초기 단계
- ✅ 기존 디자인을 빠르게 적용할 때
- ✅ 복잡한 레이아웃이 필요할 때
- ✅ CSS 애니메이션을 사용할 때

### StyleSheet 사용 시기:
- ✅ 모바일 앱 확장을 고려할 때
- ✅ 동적 스타일링이 필요할 때
- ✅ 성능 최적화가 중요할 때
- ✅ React Native Web의 장점을 활용할 때

## 🚀 미래 확장성

이 하이브리드 접근 방식의 장점:
1. **초보자 친화적**: CSS부터 시작
2. **점진적 학습**: 단계별로 React Native Web 도입
3. **모바일 확장**: 나중에 모바일 앱으로 쉽게 전환
4. **유연성**: 상황에 맞는 스타일링 방식 선택
