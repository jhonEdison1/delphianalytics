import { Ficha } from "src/modules/fichas/entities/ficha.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";





@Entity({ name: "pietajes" })
export class Pietaje {

    @PrimaryColumn()
    clavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'id_ficha' })
    ficha: Ficha;

    @Column()
    id_ficha: string;

    @Column()
    inicio: string;

    @Column()
    fin: string;

    @Column()
    duracion: string;


}
