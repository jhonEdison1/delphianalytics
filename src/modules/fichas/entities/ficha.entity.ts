import { Programa } from "src/modules/programas/entities/programa.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

//"Criterio": "Program
//"Titulo": "Con Sabor
// "Patrimonio": "No",
//"Genero": "Documenta
//"Productora": "Telec
//"Idioma": "ESP",   
//"Clasificación": ""
//
//borrar


@Entity({ name: 'fichas' })
export class Ficha {

    @PrimaryGeneratedColumn('uuid')
    clavePrincipal: string;

    @Column()
    nombreArchivo: string;

    @Column()
    codigoArchivo: string;

    @ManyToOne(() => Programa)
    @JoinColumn({ name: 'id_programa' })
    programa: Programa;

    @Column()
    id_programa: string;

    @Column()
    error: string;

    @Column()
    referencia: string;

    @Column()
    fechaRealizacion: string;

    @Column()
    fechaEmision: string;

    @Column()
    casaProductora: string;

    @Column()
    formato: string;

    @Column()
    tipoArchivoRecibido: string;

    @Column()
    tipoArchivoGuardado: string;

    @Column()
    soporteFisicoGrabacion: string;

    @Column()
    resolucion: string;

    @Column()
    tasaRecuadro: string;

    @Column()
    codecVideo: string;

    @Column()
    codecAudio: string;

    @Column()
    canalesAudio: string;

    @Column()
    tasaMuestra: string;

    @Column()
    bitsPorMuestra: string;

    @Column()
    sistemaAcceso: string;

    @Column()
    duracion: string;

    @Column()
    sinopsis: string;

    @Column()
    observaciones: string;

    @Column()
    copyright: string;


}

// @Column()
// criterio: string;

// @Column()
// titulo: string;

// @Column()
// idioma: string;

// @Column()
// clasificacion: string;

// @Column()
// productora: string;

// @Column()
// patrimonio: string;

// @Column()
// genero: string;

