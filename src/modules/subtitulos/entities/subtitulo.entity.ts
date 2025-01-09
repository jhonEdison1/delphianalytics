import { Ficha } from 'src/modules/fichas/entities/ficha.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index, IndexOptions, PrimaryGeneratedColumn } from 'typeorm';


@Entity({ name: 'subtitulos' })
export class Subtitulo {
    @PrimaryGeneratedColumn('uuid')
    clavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'id_ficha' })
    ficha: Ficha;

    @Column()
    id_ficha: string;

    @Column()
    linea: number;

    @Column()
    tiempo_Inicio: string;

    @Column()
    tiempo_Fin: string;

    @Column('tsvector')
    @Index('idx_subtitulo_texto_gin', {
        synchronize: false, // Evita que TypeORM trate de sincronizar el índice automáticamente
        fulltext: true,
        name: 'idx_subtitulo_texto_gin',
        unique: false,
        spatial: false,
        parser: 'pg_catalog.tsvector_ops',
        using: 'GIN',
        where: ''
    } as IndexOptions)
    texto: string;

    @Column({ nullable: true })
    textoOriginal: string; // Campo para almacenar el texto sin procesar
}