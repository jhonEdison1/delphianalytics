import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'fichas'})
export class Ficha {

    @PrimaryGeneratedColumn('uuid')
    clavePrincipal: string;

    @Column()
    nombreArchivo: string;

    @Column()
    codigoArchivo: string;

    @Column()
    criterio: string;

    @Column()
    titulo: string;

    @Column()
    error: string;

    @Column()
    referencia: string;

    @Column()
    patrimonio: string;

    @Column()
    genero: string;

    @Column()
    fechaRealizacion: string;

    @Column()
    fechaEmision: string;

    @Column()
    productora: string;

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

    @Column()
    idioma: string;

    @Column()
    clasificacion: string;
}

