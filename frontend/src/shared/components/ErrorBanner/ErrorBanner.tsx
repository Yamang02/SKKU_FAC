import React from 'react';
import { Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ErrorState } from '../../../hooks/useErrorHandler';

interface ErrorBannerProps {
    error: ErrorState;
    onClose: () => void;
    onRetry?: () => void;
    retryText?: string;
    style?: React.CSSProperties;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
    error,
    onClose,
    onRetry,
    retryText = '다시 시도',
    style = { marginBottom: '16px' }
}) => {
    if (!error.show) {
        return null;
    }

    return (
        <Alert
            message={error.title}
            description={
                <div>
                    <div style={{ marginBottom: '8px' }}>{error.message}</div>
                    {error.details && (
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            marginTop: '4px',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                        }}>
                            상세 정보: {error.details}
                        </div>
                    )}
                </div>
            }
            type={error.type}
            showIcon
            closable
            onClose={onClose}
            action={
                onRetry && (
                    <Space>
                        <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                onClose();
                                onRetry();
                            }}
                        >
                            {retryText}
                        </Button>
                    </Space>
                )
            }
            style={style}
        />
    );
};
