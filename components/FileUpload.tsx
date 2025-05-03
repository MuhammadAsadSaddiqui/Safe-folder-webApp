// components/FileUpload.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadError(null);
            setUploadSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadError('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', file);

            await axios.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadSuccess(true);
            setFile(null);
            // Clear the file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Trigger event to refresh file list
            window.dispatchEvent(new CustomEvent('fileUploaded'));

        } catch (error) {
            console.error('Upload error:', error);
            setUploadError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-white/50">
            <div className="space-y-2">
                <Label htmlFor="file-upload" className="font-medium">Select a file to upload</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors">
                        <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                        </svg>
                        <span className="mt-2 text-base">
                            {file ? file.name : 'Select a file'}
                        </span>
                        <input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {file && (
                <div className="text-sm p-3 bg-blue-50 rounded-md">
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center justify-between text-gray-500">
                        <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                        <p>Type: {file.type || 'Unknown'}</p>
                    </div>
                </div>
            )}

            <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
            >
                {uploading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                    </span>
                ) : 'Upload File'}
            </Button>

            {uploadError && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-md">
                    {uploadError}
                </div>
            )}

            {uploadSuccess && (
                <div className="text-green-500 text-sm mt-2 p-2 bg-green-50 rounded-md">
                    File uploaded successfully!
                </div>
            )}
        </div>
    );
}