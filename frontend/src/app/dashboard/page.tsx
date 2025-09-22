'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiClient } from '@/lib/api-client';
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: {
    status: string;
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface AppInfo {
  name: string;
  version: string;
  description: string;
  environment: string;
  timestamp: string;
  uptime: number;
}

export default function DashboardPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = useApiClient();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch health status
      const healthResponse = await apiClient.get('/health');
      setHealthStatus(healthResponse.data.data);

      // Fetch app info
      const appResponse = await apiClient.get('/');
      setAppInfo(appResponse.data.data);

      toast.success('Dashboard data loaded successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Project Management Software
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Application Info */}
        {appInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Application Info</span>
              </CardTitle>
              <CardDescription>
                Basic application information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{appInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Version:</span>
                <Badge variant="outline">{appInfo.version}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Environment:</span>
                <Badge className={appInfo.environment === 'production' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {appInfo.environment}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Uptime:</span>
                <span className="text-sm">{formatUptime(appInfo.uptime)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Status */}
        {healthStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(healthStatus.status)}
                <span>System Health</span>
              </CardTitle>
              <CardDescription>
                Current system status and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(healthStatus.status)}>
                  {healthStatus.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Database:</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(healthStatus.database.status)}
                  <span className="text-sm">{healthStatus.database.responseTime}ms</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Memory:</span>
                <span className="text-sm">{healthStatus.memory.percentage}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Memory Usage */}
        {healthStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
              <CardDescription>
                Current memory consumption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Used:</span>
                <span className="text-sm">{formatBytes(healthStatus.memory.used)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-sm">{formatBytes(healthStatus.memory.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${healthStatus.memory.percentage}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {healthStatus.memory.percentage}% used
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg">👥</span>
              <span>Employees</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg">📊</span>
              <span>Projects</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg">⏰</span>
              <span>Time Tracking</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg">📈</span>
              <span>Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
