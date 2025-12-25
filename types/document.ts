type UploadedDocument = {
    docId: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    status: 'uploaded' | 'ingested' | 'failed';
    createdAt: string;
}

export type { UploadedDocument }