import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600, // Tempo de vida do cache em segundos (1 hora)
      max: 100, // Número máximo de itens no cache
      isGlobal: true, // Disponibiliza o cache para todos os módulos
    }),
  ],
  controllers: [UniversityController],
  providers: [UniversityService],
})
export class UniversityModule { }
