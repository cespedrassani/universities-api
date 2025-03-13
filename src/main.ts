import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Universidades')
    .setDescription('API para buscar informações sobre universidades ao redor do mundo')
    .setVersion('1.0')
    .addTag('universities')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuração do ValidationPipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Inicia o servidor
  await app.listen(3000);
  console.log(`Aplicação rodando em: http://localhost:3000`);
  console.log(`Documentação Swagger: http://localhost:3000/api`);
}
bootstrap();
