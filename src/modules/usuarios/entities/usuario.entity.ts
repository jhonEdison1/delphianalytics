import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



export enum rolEnum {
    USER = 'user',
    ADMIN = 'admin'
  
}



@Entity({ name: 'usuarios'})
export class Usuario {

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true})
    email: string;

    @Column({
        type: 'enum',
        enum: rolEnum,
        default: rolEnum.USER
      })
      rol: 'admin' | 'user'; 
  
    @Column()
    password: string;
}
