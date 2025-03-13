import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UniversityService } from '../src/university/university.service';

describe('UniversityController (e2e)', () => {
  let app: INestApplication;
  let universityService: UniversityService;

  const mockUniversities = [
    {
      name: 'Harvard University',
      country: 'United States',
      alpha_two_code: 'US',
      domains: ['harvard.edu'],
      web_pages: ['http://www.harvard.edu'],
    },
  ];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UniversityService)
      .useValue({
        findAll: jest.fn().mockResolvedValue(mockUniversities),
        searchByName: jest.fn().mockResolvedValue(mockUniversities),
        searchByCountry: jest.fn().mockResolvedValue(mockUniversities),
        searchByDomain: jest.fn().mockResolvedValue(mockUniversities),
        search: jest.fn().mockResolvedValue(mockUniversities),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    universityService = moduleFixture.get<UniversityService>(UniversityService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/universities (GET)', () => {
    it('deve retornar lista de universidades', () => {
      return request(app.getHttpServer())
        .get('/universities')
        .expect(200)
        .expect(mockUniversities);
    });

    it('deve chamar o serviço findAll', async () => {
      await request(app.getHttpServer()).get('/universities');
      expect(universityService.findAll).toHaveBeenCalled();
    });
  });

  describe('/universities/search (GET)', () => {
    it('deve retornar universidades filtradas com múltiplos parâmetros', () => {
      return request(app.getHttpServer())
        .get('/universities/search?name=Harvard&country=United States')
        .expect(200)
        .expect(mockUniversities);
    });

    it('deve chamar o serviço search com os parâmetros corretos', async () => {
      await request(app.getHttpServer()).get('/universities/search?name=Harvard&country=United States');
      expect(universityService.search).toHaveBeenCalledWith({ name: 'Harvard', country: 'United States' });
    });
  });

  // Outros testes E2E para endpoints adicionais
});
