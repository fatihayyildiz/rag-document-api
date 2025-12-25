import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [DocumentsModule, EmbeddingsModule, VectorStoreModule],
  providers: [IngestionService],
  exports: [IngestionService]
})
export class IngestionModule {}