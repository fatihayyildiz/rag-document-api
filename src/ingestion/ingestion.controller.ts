import { Controller, Param, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('documents')
export class IngestionController {
  constructor(private readonly ingestion: IngestionService) {}

  @Post(':id/ingest')
  ingest(@Param('id') id: string) {
    return this.ingestion.ingest(id);
  }
}