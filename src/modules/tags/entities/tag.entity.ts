import { Ficha } from "src/modules/fichas/entities/ficha.entity";
import { Column, Entity, Index, IndexOptions, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";


// {
//     "ClavePrincipal": "D7374E90-B5DC-844E-8867-CD22FCB4F2BC",
//     "ID Ficha": "050367C4-6E17-A04F-AFA3-C745BDEE3D75",
//     "Tag": "Manizales"
// }


@Entity({ name: "tags" })
export class Tag {

    @PrimaryGeneratedColumn('uuid')
    clavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'id_ficha' })
    ficha: Ficha;

    @Column()
    id_ficha: string;

    @Column('tsvector')
    @Index('idx_tag_texto_gin', {
        synchronize: false, // Evita que TypeORM trate de sincronizar el índice automáticamente
        fulltext: true,
        name: 'idx_tag_texto_gin',
        unique: false,
        spatial: false,
        parser: 'pg_catalog.tsvector_ops',
        using: 'GIN',
        where: ''
    } as IndexOptions)
    textoTag: string;

    @Column({ nullable: true })
    textoOriginal: string; // Campo para almacenar el texto sin procesar

}
