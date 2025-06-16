import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from './App.jsx';

// React Native Web 앱 등록
AppRegistry.registerComponent('SKKU_Gallery', () => App);

// 웹에서 실행
const container = document.getElementById('root');
const root = createRoot(container);

AppRegistry.runApplication('SKKU_Gallery', {
    rootTag: container
});
