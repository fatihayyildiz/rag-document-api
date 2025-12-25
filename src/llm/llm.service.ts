import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

  getModel() {
    return this.model;
  }

  async answerWithContext(input: { question: string; context: string }) {
    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Answer using ONLY the provided context. If the context is insufficient, say you do not know.'
        },
        {
          role: 'user',
          content: `Context:\n${input.context}\n\nQuestion:\n${input.question}`
        }
      ]
    });

    return res.choices[0]?.message?.content?.trim() ?? '';
  }
}