import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class ZarinpalAttempt extends VendureEntity {
    constructor() { super(); }

    @Index('IDX_zarinpal_attempt_authority', { unique: true })
    @Column({ type: 'varchar', length: 100 })
    authority: string;

    @Column({ type: 'varchar', length: 64 })
    orderId: string;

    @Column({ type: 'varchar', length: 64 })
    userId: string;

    @Column({ type: 'integer' })
    amount: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    referenceId: string | null;
}
