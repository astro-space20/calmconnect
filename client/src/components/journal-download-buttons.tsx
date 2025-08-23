import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JournalDownloadButtonsProps {
  className?: string;
}

export default function JournalDownloadButtons({ className = "" }: JournalDownloadButtonsProps) {
  const [downloading, setDownloading] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDownload = async (weeks: number) => {
    try {
      setDownloading(weeks);
      
      const response = await fetch(`/api/thought-journals/download/${weeks}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to download journal');
      }

      // Get the file content
      const fileContent = await response.text();
      
      // Create and trigger download
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thought-journal-${weeks}-weeks.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete!",
        description: `Your ${weeks} week conversation has been downloaded.`,
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download your journal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card className={`card-shadow border-0 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Download Your Journey</span>
        </CardTitle>
        <CardDescription>
          Export your thought journal conversations as text files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {/* 1 Week Button */}
          <Button
            variant="outline"
            className="h-auto p-4 flex items-center justify-between hover:bg-blue-50 border-blue-200"
            onClick={() => handleDownload(1)}
            disabled={downloading !== null}
            data-testid="download-1-week"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Past Week</div>
                <div className="text-sm text-gray-600">Last 7 days</div>
              </div>
            </div>
            {downloading === 1 ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <Download className="w-5 h-5 text-blue-600" />
            )}
          </Button>

          {/* 2 Weeks Button */}
          <Button
            variant="outline"
            className="h-auto p-4 flex items-center justify-between hover:bg-blue-50 border-blue-200"
            onClick={() => handleDownload(2)}
            disabled={downloading !== null}
            data-testid="download-2-weeks"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Past 2 Weeks</div>
                <div className="text-sm text-gray-600">Last 14 days</div>
              </div>
            </div>
            {downloading === 2 ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <Download className="w-5 h-5 text-indigo-600" />
            )}
          </Button>

          {/* 3 Weeks Button */}
          <Button
            variant="outline"
            className="h-auto p-4 flex items-center justify-between hover:bg-blue-50 border-blue-200"
            onClick={() => handleDownload(3)}
            disabled={downloading !== null}
            data-testid="download-3-weeks"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Past 3 Weeks</div>
                <div className="text-sm text-gray-600">Last 21 days</div>
              </div>
            </div>
            {downloading === 3 ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            ) : (
              <Download className="w-5 h-5 text-purple-600" />
            )}
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Files will be saved as .txt format for easy reading and sharing
        </div>
      </CardContent>
    </Card>
  );
}