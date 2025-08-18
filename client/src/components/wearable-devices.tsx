import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Watch, 
  Smartphone, 
  Activity, 
  Heart, 
  Moon, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2,
  Plus,
  Upload
} from "lucide-react";
import { WearableDevice } from "@shared/schema";

export default function WearableDevices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['/api/wearables'],
  });

  const connectMutation = useMutation({
    mutationFn: async (deviceType: string) => {
      const response = await apiRequest('/api/wearables/connect', {
        method: 'POST',
        body: { deviceType }
      });
      return response;
    },
    onSuccess: (data) => {
      // Open OAuth window
      const authWindow = window.open(data.authUrl, 'wearable-auth', 'width=600,height=600');
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          // Refresh devices list
          queryClient.invalidateQueries({ queryKey: ['/api/wearables'] });
          toast({
            title: "Connection Successful",
            description: "Your wearable device has been connected successfully.",
          });
        }
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wearable device.",
        variant: "destructive"
      });
    }
  });

  const syncMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return await apiRequest(`/api/wearables/${deviceId}/sync`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "Your wearable data has been synced successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync wearable data.",
        variant: "destructive"
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return await apiRequest(`/api/wearables/${deviceId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wearables'] });
      toast({
        title: "Device Disconnected",
        description: "Your wearable device has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect device.",
        variant: "destructive"
      });
    }
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'fitbit':
        return <Activity className="w-5 h-5" />;
      case 'apple_health':
        return <Watch className="w-5 h-5" />;
      case 'google_fit':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getDeviceName = (deviceType: string) => {
    switch (deviceType) {
      case 'fitbit':
        return 'Fitbit';
      case 'apple_health':
        return 'Apple Health';
      case 'google_fit':
        return 'Google Fit';
      case 'garmin':
        return 'Garmin';
      case 'samsung_health':
        return 'Samsung Health';
      default:
        return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    }
  };

  const availableDevices = [
    { type: 'fitbit', name: 'Fitbit', description: 'Activity, sleep, and heart rate tracking' },
    { type: 'google_fit', name: 'Google Fit', description: 'Activity and fitness data from Android devices' },
    { type: 'apple_health', name: 'Apple Health', description: 'Comprehensive health data from iOS devices (manual import)' }
  ];

  const connectedDeviceTypes = devices.map((d: WearableDevice) => d.deviceType);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Wearable Devices</h2>
        <p className="text-gray-600">Connect your fitness trackers and health devices to automatically track your activities</p>
      </div>

      {/* Connected Devices */}
      {devices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Devices</h3>
          <div className="grid gap-4">
            {devices.map((device: WearableDevice) => (
              <Card key={device.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.deviceType)}
                      <div>
                        <CardTitle className="text-base">{device.deviceName}</CardTitle>
                        <CardDescription>{getDeviceName(device.deviceType)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={device.isConnected ? "default" : "secondary"}>
                        {device.isConnected ? (
                          <>
                            <Wifi className="w-3 h-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3 mr-1" />
                            Disconnected
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Last sync: {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncMutation.mutate(device.id)}
                        disabled={!device.isConnected || syncMutation.isPending}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectMutation.mutate(device.id)}
                        disabled={disconnectMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Available Devices */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connect New Device</h3>
        <div className="grid gap-4">
          {availableDevices
            .filter(device => !connectedDeviceTypes.includes(device.type))
            .map((device) => (
              <Card key={device.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <CardTitle className="text-base">{device.name}</CardTitle>
                        <CardDescription>{device.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={() => connectMutation.mutate(device.type)}
                      disabled={connectMutation.isPending}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>
      </div>

      {/* Manual Data Import */}
      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Manual Data Import</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Import Health Data
            </CardTitle>
            <CardDescription>
              Upload health data from Apple Health exports or other sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".xml,.csv,.json"
              className="mb-3 block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 
                file:text-sm file:font-medium 
                file:bg-blue-50 file:text-blue-700 
                hover:file:bg-blue-100"
            />
            <Button variant="outline" size="sm">
              Upload Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Overview */}
      {devices.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Steps Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">8,247</div>
                  <div className="text-xs text-gray-600">Goal: 10,000</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Avg Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">72 bpm</div>
                  <div className="text-xs text-gray-600">Resting: 65 bpm</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Moon className="w-4 h-4 mr-2" />
                    Last Night
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">7h 23m</div>
                  <div className="text-xs text-gray-600">Deep: 1h 45m</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}