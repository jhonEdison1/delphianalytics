import { Ficha } from "src/modules/fichas/entities/ficha.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "sountracks" })
export class Soundtrack {
    @PrimaryColumn()
    clavePrincipal: string;

    @ManyToOne(() => Ficha)
    @JoinColumn({ name: 'id_ficha' })
    ficha: Ficha;
    
    @Column()
    id_ficha: string;
    
    @Column()
    principal: string;
    
    @Column()
    título: string;
    
    @Column()
    artista: string;
    
    @Column()
    copyright: string;


}
