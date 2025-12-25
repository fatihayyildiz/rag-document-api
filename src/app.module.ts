import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentsModule } from '@/documents/documents.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionModule } from '@/ingestion/ingestion.module';
import { EmbeddingsModule } from '@/embeddings/embeddings.module';
import { VectorStoreModule } from '@/vector-store/vector-store.module';
import { IngestionController } from '@/ingestion/ingestion.controller';
import { LlmModule } from '@/llm/llm.module';
import { RagModule } from '@/rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: Number(configService.get<number>('POSTGRES_PORT', 5432)),
        username: configService.get<string>('POSTGRES_USER', 'rag'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'rag_password_change_me'),
        database: configService.get<string>('POSTGRES_DB', 'rag'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'true') === 'true',
      }),
    }),
    DocumentsModule,
    IngestionModule,
    EmbeddingsModule,
    VectorStoreModule,
    LlmModule,
    RagModule
  ],
  controllers: [AppController, IngestionController],
  providers: [AppService],
})
export class AppModule {}
