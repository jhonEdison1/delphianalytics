import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import config from 'src/config';

@Injectable()
export class OpenaiService {

    private token = '';
    private openai: OpenAI;

    // private active: boolean = false;

    constructor(@Inject(config.KEY) configService: ConfigType<typeof config>) {
        this.token = configService.openAi.token;
        // this.active = configService.openAi.active === 'true'? true : false;
        // console.log(this.active);
        this.openai = new OpenAI({
        apiKey: this.token,
        });
    }

    async traducirTexto(texto: string, idioma: string): Promise<any> {
        try {
            const prompt = `Traduce el siguiente texto al idioma ${idioma}: ${texto}. Y retorna solamente el texto traducido.`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'you are a helpful assistant.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    }
                ]
            });

            const traduccion = response.choices[0].message.content;

            return { ok: true, traduccion };
        } catch (error) {
            return error;
        }
    }

    async resumirTexto(texto: string): Promise<any> {
        const prompt = `Resumir el siguiente texto y obten algunas ideas princiaples. Devuelve todo en formato HTML, utilizando clases de Tailwind CSS para mejorar su presentación en una página web pero devuélvelo sin los delimitadores de bloque de código al inicio y al final ademas de no usar clases de bordes ni fondos, los titulos deberan tener la clase text-primary\n\n: ${texto}`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Generando resumen del texto.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    }
                ]
            });

            return { ok: true, resumen: response.choices[0].message.content };
        } catch (error) {
            return { ok: false, resumen: null, error };
        }
           
    }
}
