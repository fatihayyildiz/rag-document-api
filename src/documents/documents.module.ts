import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './document.entity';
import { IngestionModule } from '@/ingestion/ingestion.module';
import { EmbeddingsModule } from '@/embeddings/embeddings.module';
import { VectorStoreModule } from '@/vector-store/vector-store.module';


@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
