import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetrics {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface SupabasePerformanceData {
  metrics: PerformanceMetrics;
  userId?: string;
  sessionId: string;
  page: string;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMetrics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics(): void {
    // Collect Core Web Vitals
    getCLS((metric) => {
      this.metrics.CLS = metric.value;
      this.sendMetricsToSupabase('CLS', metric.value);
    });

    getFID((metric) => {
      this.metrics.FID = metric.value;
      this.sendMetricsToSupabase('FID', metric.value);
    });

    getFCP((metric) => {
      this.metrics.FCP = metric.value;
      this.sendMetricsToSupabase('FCP', metric.value);
    });

    getLCP((metric) => {
      this.metrics.LCP = metric.value;
      this.sendMetricsToSupabase('LCP', metric.value);
    });

    getTTFB((metric) => {
      this.metrics.TTFB = metric.value;
      this.sendMetricsToSupabase('TTFB', metric.value);
    });

    // Collect additional performance metrics
    this.collectAdditionalMetrics();
  }

  private collectAdditionalMetrics(): void {
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.sendMetricsToSupabase('memory_used', memory.usedJSHeapSize);
      this.sendMetricsToSupabase('memory_total', memory.totalJSHeapSize);
    }

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.sendMetricsToSupabase('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      this.sendMetricsToSupabase('load_complete', navigation.loadEventEnd - navigation.loadEventStart);
    }

    // Resource timing
    const resources = performance.getEntriesByType('resource');
    const totalResourceSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    this.sendMetricsToSupabase('total_resource_size', totalResourceSize);
  }

  private async sendMetricsToSupabase(metricName: string, value: number): Promise<void> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const performanceData: SupabasePerformanceData = {
        metrics: {
          CLS: this.metrics.CLS || null,
          FID: this.metrics.FID || null,
          FCP: this.metrics.FCP || null,
          LCP: this.metrics.LCP || null,
          TTFB: this.metrics.TTFB || null,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        },
        sessionId: this.sessionId,
        page: window.location.pathname
      };

      // Insert into Supabase (assuming you have a performance_metrics table)
      const { error } = await supabase
        .from('performance_metrics')
        .insert([{
          metric_name: metricName,
          metric_value: value,
          session_id: this.sessionId,
          user_id: this.userId,
          page: window.location.pathname,
          url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }]);

      if (error) {
        console.warn('Failed to send performance metrics to Supabase:', error);
      }
    } catch (error) {
      console.warn('Error sending performance metrics:', error);
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  // Method to track custom events
  public trackEvent(eventName: string, data?: any): void {
    this.sendMetricsToSupabase(`event_${eventName}`, 1);
    
    if (data) {
      // Send additional event data
      this.sendMetricsToSupabase(`event_${eventName}_data`, JSON.stringify(data).length);
    }
  }

  // Method to track Supabase operations
  public trackSupabaseOperation(operation: string, duration: number, success: boolean): void {
    this.sendMetricsToSupabase(`supabase_${operation}_duration`, duration);
    this.sendMetricsToSupabase(`supabase_${operation}_success`, success ? 1 : 0);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export const trackPerformance = (eventName: string, data?: any) => {
  performanceMonitor.trackEvent(eventName, data);
};

export const trackSupabaseOperation = (operation: string, duration: number, success: boolean) => {
  performanceMonitor.trackSupabaseOperation(operation, duration, success);
};

export const setPerformanceUserId = (userId: string) => {
  performanceMonitor.setUserId(userId);
};

export default performanceMonitor;
