import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TravelPlan } from './travel-plan.entity';

@Entity('expenses')
export class Expense {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 100 })
    category: string;

    @Column({ name: 'travel_plan_id' })
    travelPlanId: number;

    @ManyToOne(() => TravelPlan, (travelPlan) => travelPlan.expenses, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'travel_plan_id' })
    travelPlan: TravelPlan;
}