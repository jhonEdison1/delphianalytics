import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType  } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
              type: 'postgres', // Tipo de la base de datos
              host: configService.get<string>('config.database.hostname'),
              port: configService.get<number>('config.database.port'),
              username: configService.get<string>('config.database.user'),
              password: configService.get<string>('config.database.password'),
              database: configService.get<string>('config.database.dbname'),
              autoLoadEntities: true, // Cargar entidades automáticamente desde el directorio de tu proyecto
              synchronize: true, // Sincronizar modelos con la base de datos (solo para desarrollo)
              //schema: configService.get<string>('config.database.schema'),
              entities: [__dirname + '/**/*.entity{.ts,.js}'], // Cargar todas las entidades automáticamente
            }),
          }), 
    ],
    providers: [],
    exports: [],
})
export class DatabaseModule {
    constructor(private readonly configService: ConfigService) {
        console.log('Database module loaded');
      }

}
