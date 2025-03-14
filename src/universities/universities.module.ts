import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UniversitiesController } from './universities.controller';
import { ApiClient } from '../common/services/api-client.service';
import { CacheService } from '../common/services/cache.service';
import { UniversitiesService } from './universities.service';
import { ErrorHandlerService } from '../common/services/error-handler.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600,
      max: 100,
      isGlobal: true,
    }),
  ],
  controllers: [UniversitiesController],
  providers: [
    UniversitiesService,
    ApiClient,
    CacheService,
    ErrorHandlerService,
  ],
  exports: [UniversitiesService],
})
export class UniversitiesModule { }
