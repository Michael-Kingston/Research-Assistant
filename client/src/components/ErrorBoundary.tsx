import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
                        <AlertTriangle className="h-6 w-6 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Component Failed</h2>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8 text-sm">
                        Something went wrong while rendering this section of the research platform.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:opacity-90 shadow-sm transition-all"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reload Instance
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
