export class RagQueryDto {
  query!: string;
  topK?: number;
  docId?: string; // optional: restrict search to a single document
}