import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import config from 'src/config';

@Injectable()
export class AxiosService {

    url_api: string = '';
    axiosinstance: AxiosInstance;

    constructor(
        @Inject(config.KEY) private readonly _configService: ConfigType<typeof config>
    ) {
        this.url_api= this._configService.calidad.host;
        this.axiosinstance = axios.create({
            baseURL: this.url_api,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    async getSesiones(prefijo: string) {
        try {
            const {status, data} = await this.axiosinstance.get(`sesiones/listaSesionesRevisadas/${prefijo}`);

            if(status === 200) {
                return {ok: true, data: data};
            }

            return {ok: false, data: 'Error al obtener las sesiones'};
        } catch (error) {
            return {ok: false, data: 'Error al obtener las sesiones'};
        }
    }

    async getTranscripciones(idSesion: any) {
        try {
            const {status, data} = await this.axiosinstance.get(`sesiones/transcripcionesSesion?idSesion=${idSesion}`);

            if(status === 200) {
                return {ok: true, data: data.data};
            }

            return {ok: false, data: 'Error al obtener las transcripciones'};
        } catch (error) {
            return {ok: false, data: 'Error al obtener las transcripciones'};
        }
    }

    async sincronizarSesiones(idSesion: any) {
        try {
            const {status, data} = await this.axiosinstance.post(`sesiones/sincronizarSesion`, { idSesion: idSesion });
            
            if(data.status === 200) {
                return {ok: true, data: data};
            }

            return {ok: false, data: 'Error al sincronizar la sesión'};
        } catch (error) {
            return {ok: false, data: 'Error al sincronizar la sesión'};
        }
    }
}
