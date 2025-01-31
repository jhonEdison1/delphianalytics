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
}
