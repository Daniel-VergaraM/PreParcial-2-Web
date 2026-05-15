import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Country } from '../../countries/entities/country.entity';

@Entity('travel_plans')
export class TravelPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'start_date', type: 'date' })
  start_date: Date;

  @Column({ name: 'end_date', type: 'date' })
  end_date: Date;

  @ManyToMany(() => Country, { eager: true })
  @JoinTable({
    name: 'travel_plan_countries',
    joinColumn: { name: 'travel_plan_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'country_id', referencedColumnName: 'id' },
  })
  countries: Country[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
