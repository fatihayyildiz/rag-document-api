import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  }

  getModel() {
    return this.model;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    const res = await this.client.embeddings.create({
      model: this.model,
      input: texts
    });

    return res.data.map((d) => d.embedding);
  }
}