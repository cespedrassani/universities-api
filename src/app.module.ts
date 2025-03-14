import { Module } from '@nestjs/common';
import { UniversitiesModule } from './universities/universities.module';

@Module({
  imports: [UniversitiesModule]
})
export class AppModule { }
