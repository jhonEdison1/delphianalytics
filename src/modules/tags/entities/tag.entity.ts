import { Ficha } from "src/modules/fichas/entities/ficha.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


// {
//     "ClavePrincipal": "D7374E90-B5DC-844E-8867-CD22FCB4F2BC",
//     "ID Ficha": "050367C4-6E17-A04F-AFA3-C745BDEE3D75",
//     "Tag": "Manizales"
// }


@Entity({ name: "tags" })
export class Tag {

    @PrimaryColumn()
    clavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'id_ficha' })
    ficha: Ficha;

    @Column()
    id_ficha: string;

    @Column('tsvector')
    @Index({ fulltext: true })
    textoTag: string;

    @Column({ nullable: true })
    textoOriginal: string; // Campo para almacenar el texto sin procesar

}
