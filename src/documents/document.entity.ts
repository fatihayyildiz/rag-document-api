import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'documents' })
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  userId: string;

  @Column()
  originalName: string;

  @Column()
  storedName: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  @Column()
  storagePath: string;

  @Index()
  @Column({ default: 'uploaded' })
  status: 'uploaded' | 'ingested' | 'failed';

  @CreateDateColumn()
  createdAt: Date;
}