import {
  Controller,
  Get,
  UseInterceptors,
  Param,
  Post,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { sanitizeFilename } from 'utils/files';
import { lookup as lookupMime } from 'mime-types';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentService: DocumentsService) {}

  @Get()
  listDocuments(@CurrentUser('id') userId: string) {
    return this.documentService.findAllByUserId(userId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'storage', 'uploads'),
        filename: (req, file, cb) => {
          const safe = sanitizeFilename(file.originalname);
          const ext = path.extname(safe);
          const base = path.basename(safe, ext);
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${base}-${unique}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024 * 5, // 50 MB
      },
    }),
  )
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.documentService.saveToLocale(file, userId);
  }

  @Get(':id')
  getDocumentById(@Param('id') id: string) {
    return this.documentService.getById(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { path, originalName, mimeType } =
      await this.documentService.getFilePathById(id);

    const contentType =
      mimeType ||
      (lookupMime(originalName) as string) ||
      'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(originalName)}"`,
    );

    const stream = createReadStream(path);
    stream.on('error', () => res.status(404).send('File not found'));

    return stream.pipe(res);
  }
}
