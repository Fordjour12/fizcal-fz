import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundaryClass extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
