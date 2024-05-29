import { Ficha } from "src/modules/fichas/entities/ficha.entity";
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index, IndexOptions } from 'typeorm';

@Entity({ name: 'creditos' })
export class Credito {
    @PrimaryColumn()
    clavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'id_ficha' })
    ficha: Ficha;

    @Column()
    id_ficha: string;

    @Column()
    persona: string;

    @Column()
    cargo: string;
}