import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileIcon, X, Download, Eye, ExternalLink } from 'lucide-react';

interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

interface FilePreviewProps {
  attachment: Attachment;
}

export function FilePreview({ attachment }: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Check if the file is an image
  const isImage = attachment.file_type.startsWith('image/');
  
  // Check if the file is a PDF
  const isPdf = attachment.file_type === 'application/pdf';
  
  // Check if the file is a video
  const isVideo = attachment.file_type.startsWith('video/');
  
  // Check if the file is audio
  const isAudio = attachment.file_type.startsWith('audio/');
  
  // Get the full URL for the attachment
  const attachmentUrl = `/storage/${attachment.file_path}`;
  
  return (
    <Card className="overflow-hidden border rounded-md max-w-sm">
      <CardContent className="p-0">
        <div className="p-3 flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{attachment.file_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <a href={attachmentUrl} download target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </a>
            {(isImage || isPdf || isVideo || isAudio) && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileIcon className="h-5 w-5" />
                      {attachment.file_name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 flex justify-center items-center max-h-[70vh] overflow-auto">
                    {isImage && (
                      <img 
                        src={attachmentUrl} 
                        alt={attachment.file_name} 
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    )}
                    {isPdf && (
                      <iframe 
                        src={`${attachmentUrl}#view=FitH`} 
                        className="w-full h-[70vh]" 
                        title={attachment.file_name}
                      />
                    )}
                    {isVideo && (
                      <video 
                        src={attachmentUrl} 
                        controls 
                        className="max-w-full max-h-[70vh]"
                      />
                    )}
                    {isAudio && (
                      <audio 
                        src={attachmentUrl} 
                        controls 
                        className="w-full"
                      />
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(attachment.file_size)}
                    </span>
                    <a 
                      href={attachmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open in new tab
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        {isImage && (
          <div className="relative aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
            <img 
              src={attachmentUrl} 
              alt={attachment.file_name} 
              className="max-w-full max-h-[200px] object-contain"
              onClick={() => setIsOpen(true)}
            />
          </div>
        )}
        <div className="p-3 text-xs text-muted-foreground">
          {formatFileSize(attachment.file_size)}
        </div>
      </CardContent>
    </Card>
  );
}
