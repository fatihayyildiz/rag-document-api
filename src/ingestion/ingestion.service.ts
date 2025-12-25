import { Injectable } from '@nestjs/common';
import { DocumentsService } from '../documents/documents.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { ChromaStore } from '../vector-store/chroma.store';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';

function chunkText(text: string, opts?: { chunkSize?: number; overlap?: number }) {
  const chunkSize = opts?.chunkSize ?? 1200;
  const overlap = opts?.overlap ?? 200;

  const clean = text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === clean.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly documents: DocumentsService,
    private readonly embeddings: EmbeddingsService,
    private readonly chroma: ChromaStore
  ) {}

  async ingest(docId: string) {
    try {
      const { path: filePath, originalName, mimeType } = await this.documents.getFilePathById(docId);

      const text = await this.extractText(filePath, originalName, mimeType);
      const chunks = chunkText(text);

      if (!chunks.length) {
        throw new Error('No text extracted or produced zero chunks.');
      }

      const batchSize = 64;
      let totalUpserted = 0;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const vectors = await this.embeddings.embedMany(batch);

        const ids = batch.map((_, idx) => `${docId}:${i + idx}`);
        const metadatas = batch.map((_, idx) => ({
          docId,
          chunkIndex: i + idx,
          source: originalName,
          mimeType
        }));

        await this.chroma.upsert({
          ids,
          embeddings: vectors,
          documents: batch,
          metadatas
        });

        totalUpserted += batch.length;
      }

      await this.documents.updateStatus(docId, 'ingested');

      return {
        docId,
        status: 'ingested',
        chunks: totalUpserted,
        embeddingModel: this.embeddings.getModel()
      };
    } catch (err: any) {
      await this.documents.updateStatus(docId, 'failed');
      return {
        docId,
        status: 'failed',
        error: err?.message ?? String(err)
      };
    }
  }

  private async extractText(filePath: string, originalName: string, mimeType: string) {
    const ext = path.extname(originalName).toLowerCase();

    // PDF
    if (mimeType === 'application/pdf' || ext === '.pdf') {
      const buffer = await fs.readFile(filePath);
      const pdfParser = new PDFParse({ data: buffer });
      const result = await pdfParser.getText();
      return result.text || '';
    }

    // Plain text / markdown
    if (mimeType.startsWith('text/') || ext === '.txt' || ext === '.md') {
      return await fs.readFile(filePath, 'utf-8');
    }

    // unsupported
    throw new Error(`Unsupported file type for ingestion: mimeType=${mimeType}, ext=${ext}`);
  }
}