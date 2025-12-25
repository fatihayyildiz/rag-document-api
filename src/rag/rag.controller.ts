import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagQueryDto } from './dto/rag-query.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post('query')
  query(@Body() body: RagQueryDto) {
    return this.rag.query({
      query: body.query,
      topK: body.topK,
      docId: body.docId
    });
  }
}