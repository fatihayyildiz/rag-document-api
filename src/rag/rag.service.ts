import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { ChromaStore } from '../vector-store/chroma.store';
import { LlmService } from '../llm/llm.service';

function buildContext(docs: string[], metas: Record<string, any>[], maxChars: number) {
  let out = '';
  const sources: Array<{ docId?: string; source?: string; chunkIndex?: number }> = [];

  for (let i = 0; i < docs.length; i++) {
    const m = metas[i] || {};
    const header = `[source ${i + 1}] docId=${m.docId ?? ''} chunk=${m.chunkIndex ?? ''} file=${m.source ?? ''}\n`;
    const block = `${header}${docs[i]}\n\n`;

    if (out.length + block.length > maxChars) break;

    out += block;
    sources.push({ docId: m.docId, source: m.source, chunkIndex: m.chunkIndex });
  }

  return { context: out.trim(), sources };
}

@Injectable()
export class RagService {
  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly chroma: ChromaStore,
    private readonly llm: LlmService
  ) {}

  async query(input: { query: string; topK?: number; docId?: string }) {
    const topK = input.topK ?? Number(process.env.RAG_TOP_K ?? '5');
    const maxChars = Number(process.env.RAG_MAX_CONTEXT_CHARS ?? '12000');

    const [qVec] = await this.embeddings.embedMany([input.query]);

    const where = input.docId ? { docId: input.docId } : undefined;

    const retrieved = await this.chroma.queryByEmbedding({
      queryEmbedding: qVec,
      nResults: topK,
      where
    });

    console.log('RAG Retrieved IDs:', retrieved);

    const { context, sources } = buildContext(
      retrieved.documents,
      retrieved.metadatas,
      maxChars
    );

    console.log('RAG Context:', context);

    const answer = await this.llm.answerWithContext({
      question: input.query,
      context
    });

    return {
      answer,
      sources,
      debug: {
        topK,
        embeddingModel: this.embeddings.getModel(),
        chatModel: this.llm.getModel(),
        matched: retrieved.ids.length,
        docs: retrieved.documents
      }
    };
  }
}