import { Ficha } from 'src/modules/fichas/entities/ficha.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';


@Entity({ name: 'subtitulos' })
export class Subtitulo {
    @PrimaryColumn()
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
    @Index({ fulltext: true })
    texto: string;

    @Column({ nullable: true })
    textoOriginal: string; // Campo para almacenar el texto sin procesar
}