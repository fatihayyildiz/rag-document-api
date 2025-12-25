import { Injectable } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

type UpsertPayload = {
  ids: string[];
  embeddings: number[][];
  documents: string[];
  metadatas: Record<string, any>[];
};

@Injectable()
export class ChromaStore {
  private client: ChromaClient;
  private collectionName: string;

  constructor() {
    const host = process.env.CHROMA_HOST || 'localhost';
    const port = process.env.CHROMA_PORT || '8000';
    this.collectionName = process.env.CHROMA_COLLECTION || 'default_kb';

    this.client = new ChromaClient({
      path: `http://${host}:${port}`
    });
  }

  private async getCollection() {
    return this.client.getOrCreateCollection({ name: this.collectionName });
  }

  async upsert(payload: UpsertPayload) {
    const collection = await this.getCollection();
    await collection.upsert(payload);
  }

  async queryByEmbedding(args: {
    queryEmbedding: number[];
    nResults: number;
    where?: Record<string, any>;
  }): Promise<{
    ids: string[];
    documents: string[];
    metadatas: Record<string, any>[];
    distances?: number[];
  }> {
    const collection = await this.getCollection();

    const res = await collection.query({
      queryEmbeddings: [args.queryEmbedding],
      nResults: args.nResults,
      where: args.where,
      include: ['documents', 'metadatas', 'distances']
    } as any);

    // Chroma returns arrays per query. We have only 1 query.
    return {
      ids: (res.ids?.[0] ?? []) as string[],
      documents: (res.documents?.[0] ?? []) as string[],
      metadatas: (res.metadatas?.[0] ?? []) as Record<string, any>[],
      distances: (res.distances?.[0] ?? []) as number[]
    };
  }

}