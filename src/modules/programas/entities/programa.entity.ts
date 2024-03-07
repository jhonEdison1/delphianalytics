
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'programas'})
export class Programa {

    @PrimaryGeneratedColumn('uuid')
    clavePrincipal: string;

    @Column()
    titulo: string;

    @Column()
    criterio: string;

    @Column()
    genero: string;

    @Column()
    patrimonio: string;

    @Column({nullable: true})
    clasificacion: string;

    @Column()
    idioma: string;

    @Column()
    productora: string;
    
    @Column({nullable: true})
    imagen: string;

}
