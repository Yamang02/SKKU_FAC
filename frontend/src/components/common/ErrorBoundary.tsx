import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('관리자 앱 에러:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '50px' }}>
                    <Result
                        status="error"
                        icon={<ExclamationCircleOutlined />}
                        title="오류가 발생했습니다"
                        subTitle={
                            process.env.NODE_ENV === 'development'
                                ? this.state.error?.message
                                : "예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요."
                        }
                        extra={[
                            <Button type="primary" key="retry" onClick={this.handleReset}>
                                페이지 새로고침
                            </Button>,
                            <Button key="home" onClick={() => window.location.href = '/admin'}>
                                관리자 홈으로
                            </Button>,
                        ]}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
