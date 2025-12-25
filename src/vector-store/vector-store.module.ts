import { Module } from '@nestjs/common';
import { ChromaStore } from './chroma.store';

@Module({
  providers: [ChromaStore],
  exports: [ChromaStore]
})
export class VectorStoreModule {}