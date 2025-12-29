import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from '@/auth/entities/user.entity';

@Entity({ name: 'documents' })
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

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