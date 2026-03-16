import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <Card className="max-w-md w-full border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Algo salió mal</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {this.state.error?.message ?? "Error inesperado en este componente."}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
