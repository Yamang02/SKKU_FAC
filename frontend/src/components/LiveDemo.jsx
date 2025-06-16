import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import '../styles/global.css';

/**
 * 실시간 개발 데모 컴포넌트
 * React Native Tools extension으로 GUI 변경사항을 확인하기 위한 컴포넌트
 */
const LiveDemo = () => {
    const [count, setCount] = useState(0);
    const [bgColor, setBgColor] = useState('bg-white');
    const [textColor, setTextColor] = useState('text-gray-800');

    const colors = [
        { bg: 'bg-white', text: 'text-gray-800', name: '화이트' },
        { bg: 'bg-gray-100', text: 'text-gray-800', name: '라이트 그레이' },
        { bg: 'bg-primary', text: 'text-white', name: '프라이머리' },
        { bg: 'bg-gray-50', text: 'text-primary', name: '소프트' }
    ];

    const handleColorChange = () => {
        const currentIndex = colors.findIndex(c => c.bg === bgColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        const nextColor = colors[nextIndex];
        setBgColor(nextColor.bg);
        setTextColor(nextColor.text);
    };

    return (
        <View className={`p-6 rounded-lg shadow-md ${bgColor}`}>
            <Text className={`text-2xl font-bold text-center mb-4 ${textColor}`}>
                🎨 실시간 개발 데모
            </Text>

            <Text className={`text-center mb-4 ${textColor}`}>
                이 컴포넌트를 수정하면 실시간으로 변경사항을 확인할 수 있습니다!
            </Text>

            <View className="flex flex-row justify-center items-center mb-4">
                <TouchableOpacity
                    className="btn btn-outline mr-3"
                    onPress={() => setCount(count - 1)}
                >
                    <Text className="btn-text">-</Text>
                </TouchableOpacity>

                <Text className={`text-xl font-semibold mx-4 ${textColor}`}>
                    카운트: {count}
                </Text>

                <TouchableOpacity
                    className="btn btn-primary ml-3"
                    onPress={() => setCount(count + 1)}
                >
                    <Text className="btn-text">+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                className="btn btn-secondary"
                onPress={handleColorChange}
            >
                <Text className="btn-text">
                    배경색 변경 ({colors.find(c => c.bg === bgColor)?.name})
                </Text>
            </TouchableOpacity>

            <View className="mt-4 p-3 border rounded">
                <Text className={`text-sm ${textColor}`}>
                    💡 팁: 이 컴포넌트의 텍스트나 스타일을 수정해보세요!
                </Text>
                <Text className={`text-xs mt-2 ${textColor}`}>
                    Hot Reload가 활성화되어 있어서 저장하면 즉시 반영됩니다.
                </Text>
            </View>
        </View>
    );
};

export default LiveDemo;
