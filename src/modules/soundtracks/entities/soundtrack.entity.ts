import { Ficha } from "src/modules/fichas/entities/ficha.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "sountracks" })
export class Soundtrack {
    @PrimaryGeneratedColumn('uuid')
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
