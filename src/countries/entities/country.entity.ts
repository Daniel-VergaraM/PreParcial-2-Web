import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 3 })
  alpha3_code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 255, nullable: true })
  capital: string;

  @Column({ type: 'bigint', nullable: true })
  population: number;

  @Column({ name: 'flag_url', length: 500, nullable: true })
  flag_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
