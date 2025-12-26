import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadedDocument } from '@/types';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentEntity } from './document.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  async saveToLocale(file: Express.Multer.File, userId: string): Promise<UploadedDocument> {
    const entity = this.documentRepository.create({
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path,
      status: 'uploaded',
      userId,
    });

    const savedDocument = await this.documentRepository.save(entity);

    return {
      docId: savedDocument.id,
      originalName: savedDocument.originalName,
      storedName: savedDocument.storedName,
      mimeType: savedDocument.mimeType,
      size: savedDocument.size,
      storagePath: path.resolve(savedDocument.storagePath),
      createdAt: savedDocument.createdAt.toISOString(),
      status: savedDocument.status,
    };
  }

  async getById(docId: string): Promise<UploadedDocument> {
    const doc = await this.documentRepository.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException(`Document not found: ${docId}`);

    return {
      docId: doc.id,
      originalName: doc.originalName,
      storedName: doc.storedName,
      mimeType: doc.mimeType,
      size: Number(doc.size),
      storagePath: doc.storagePath,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getFilePathById(
    docId: string,
  ): Promise<{ path: string; originalName: string; mimeType: string }> {
    const doc = await this.documentRepository.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException(`Document not found: ${docId}`);

    // Ensure file exists on disk
    try {
      await fs.access(doc.storagePath);
    } catch {
      throw new NotFoundException(
        `File missing on disk for document: ${docId}`,
      );
    }

    return {
      path: doc.storagePath,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
    };
  }

  async updateStatus(docId: string, status: 'uploaded' | 'ingested' | 'failed') {
    const result = await this.documentRepository.update({ id: docId }, { status });
    if (!result.affected) throw new NotFoundException(`Document not found: ${docId}`);
  }
}
