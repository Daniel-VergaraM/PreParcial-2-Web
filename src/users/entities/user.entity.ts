import { TravelPlan } from 'src/travel-plans/entities/travel-plan.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @OneToMany(() => TravelPlan, (travelPlan) => travelPlan.user, { cascade: true })
  travelPlans: TravelPlan[];
}
