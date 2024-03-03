import { Ficha } from 'src/modules/fichas/entities/ficha.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';


@Entity({ name: 'subtitulos' })
export class Subtitulo {
    @PrimaryColumn()
    ClavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'ID_Ficha' })
    ficha: Ficha;

    @Column()
    ID_Ficha: string;

    @Column()
    Linea: number;

    @Column()
    Tiempo_Inicio: string;

    @Column()
    Tiempo_Fin: string;

    @Column('tsvector')
    @Index({ fulltext: true })
    Texto: string;

    @Column({ nullable: true })
    TextoOriginal: string; // Campo para almacenar el texto sin procesar
}