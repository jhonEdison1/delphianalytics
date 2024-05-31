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

    @Column('tsvector')
    @Index('idx_credito_persona_gin', {
        synchronize: false, // Evita que TypeORM trate de sincronizar el índice automáticamente
        fulltext: true,
        name: 'idx_credito_persona_gin',
        unique: false,
        spatial: false,
        parser: 'pg_catalog.tsvector_ops',
        using: 'GIN',
        where: ''
    } as IndexOptions)
    persona_ts : string;

    @Column()
    cargo: string;
}