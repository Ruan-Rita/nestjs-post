import { IsEmail, Length, MaxLength, MinLength } from 'class-validator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { Post } from 'src/post/entity/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @Length(14)
  cpf: string;

  @Column()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @Column({ type: 'simple-array', default: [] })
  routePolicies: RoutePolicies[];

  @OneToMany(() => Post, (Post) => Post.owner)
  posts: Post[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
