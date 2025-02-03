import { Role } from "src/modules/iam/models/roles.model";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'usuarios'})
export class Usuario {

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true})
    email: string;

    @Column({
      type: 'enum',
      enum: Role,
      default: Role.USER
    })
    rol: 'admin' | 'user' | 'owner'; 
  
    @Column()
    password: string;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    color: string;
}
