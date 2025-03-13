import { Test, TestingModule } from '@nestjs/testing';
import { UniversityService } from './university.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { HttpException } from '@nestjs/common';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UniversityService', () => {
  let service: UniversityService;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    // Mock do cache manager
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversityService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<UniversityService>(UniversityService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockUniversities = [
      {
        name: 'University 1',
        country: 'Country 1',
        alpha_two_code: 'C1',
        domains: ['domain1.edu'],
        web_pages: ['http://domain1.edu'],
      },
    ];

    it('deve retornar dados do cache se disponíveis', async () => {
      cacheManager.get.mockResolvedValue(mockUniversities);

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('all_universities');
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockUniversities);
    });

    it('deve buscar dados da API e armazenar no cache se não houver cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: mockUniversities });

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('all_universities');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://universities.hipolabs.com/search');
      expect(cacheManager.set).toHaveBeenCalledWith('all_universities', mockUniversities, 3600);
      expect(result).toEqual(mockUniversities);
    });

    it('deve lançar HttpException se a API retornar erro', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('searchByName', () => {
    const mockName = 'Harvard';
    const mockUniversities = [
      {
        name: 'Harvard University',
        country: 'United States',
        alpha_two_code: 'US',
        domains: ['harvard.edu'],
        web_pages: ['http://www.harvard.edu'],
      },
    ];

    it('deve retornar dados do cache se disponíveis', async () => {
      cacheManager.get.mockResolvedValue(mockUniversities);

      const result = await service.searchByName(mockName);

      expect(cacheManager.get).toHaveBeenCalledWith(`name_${mockName}`);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockUniversities);
    });

    it('deve buscar dados da API e armazenar no cache se não houver cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: mockUniversities });

      const result = await service.searchByName(mockName);

      expect(cacheManager.get).toHaveBeenCalledWith(`name_${mockName}`);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://universities.hipolabs.com/search', {
        params: { name: mockName },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(`name_${mockName}`, mockUniversities, 3600);
      expect(result).toEqual(mockUniversities);
    });

    it('deve lançar HttpException se a API retornar erro', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.searchByName(mockName)).rejects.toThrow(HttpException);
    });
  });

  // Testes adicionais para outros métodos podem ser implementados de forma semelhante
});
