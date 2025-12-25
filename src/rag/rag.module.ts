import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [EmbeddingsModule, VectorStoreModule, LlmModule],
  controllers: [RagController],
  providers: [RagService]
})
export class RagModule {}