import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UniversityModule } from './university/university.module';

@Module({
  imports: [UniversityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
