import React, { useEffect, useRef } from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Pressable,
    StyleSheet,
    Animated,
    BackHandler,
    Platform,
} from 'react-native';
import { colors, spacing, typography } from '../../../styles';

export interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    animationType?: 'none' | 'slide' | 'fade';
    transparent?: boolean;
    closeOnBackdropPress?: boolean;
    closeOnBackButton?: boolean;
    showCloseButton?: boolean;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    title,
    children,
    animationType = 'fade',
    transparent = true,
    closeOnBackdropPress = true,
    closeOnBackButton = true,
    showCloseButton = true,
    size = 'medium',
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Handle Android back button
    useEffect(() => {
        if (Platform.OS === 'android' && closeOnBackButton) {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (visible) {
                    onClose();
                    return true;
                }
                return false;
            });

            return () => backHandler.remove();
        }
    }, [visible, closeOnBackButton, onClose]);

    // Handle ESC key for web
    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && visible) {
                    onClose();
                }
            };

            if (visible) {
                document.addEventListener('keydown', handleKeyDown);
            }

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [visible, onClose]);

    // Animate modal appearance
    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    const handleBackdropPress = () => {
        if (closeOnBackdropPress) {
            onClose();
        }
    };

    const getModalSize = () => {
        switch (size) {
            case 'small':
                return styles.modalSmall;
            case 'medium':
                return styles.modalMedium;
            case 'large':
                return styles.modalLarge;
            case 'fullscreen':
                return styles.modalFullscreen;
            default:
                return styles.modalMedium;
        }
    };

    return (
        <RNModal
            visible={visible}
            transparent={transparent}
            animationType={animationType}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                getModalSize(),
                                { opacity: fadeAnim },
                            ]}
                        >
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <View style={styles.header}>
                                    {title && (
                                        <Text style={styles.title} numberOfLines={1}>
                                            {title}
                                        </Text>
                                    )}
                                    {showCloseButton && (
                                        <TouchableOpacity
                                            style={styles.closeButton}
                                            onPress={onClose}
                                            accessibilityLabel="Close modal"
                                            accessibilityRole="button"
                                        >
                                            <Text style={styles.closeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Content */}
                            <View style={styles.content}>
                                {children}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.background.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    modalContainer: {
        backgroundColor: colors.background.primary,
        borderRadius: spacing.component.borderRadius.lg,
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        maxHeight: '90%',
    },
    modalSmall: {
        width: '80%',
        maxWidth: 400,
    },
    modalMedium: {
        width: '90%',
        maxWidth: 600,
    },
    modalLarge: {
        width: '95%',
        maxWidth: 800,
    },
    modalFullscreen: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        margin: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    title: {
        ...typography.heading.h6,
        color: colors.text.primary,
        flex: 1,
        marginRight: spacing.md,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: colors.text.secondary,
        fontWeight: 'bold',
    },
    content: {
        padding: spacing.lg,
        flex: 1,
    },
});

export default Modal;
