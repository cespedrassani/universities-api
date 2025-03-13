import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios'; // Importamos AxiosResponse
import { UniversityDto, SearchQueryDto } from './dto/university.dto';

@Injectable()
export class UniversityService {
  private readonly apiBaseUrl = 'http://universities.hipolabs.com';
  private readonly cacheTTL = 3600;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async findAll(): Promise<UniversityDto[]> {
    try {
      const cacheKey = 'all_universities';
      const cachedData = await this.cacheManager.get<UniversityDto[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Tipagem explícita da resposta do axios
      const response: AxiosResponse<UniversityDto[]> = await axios.get(
        `${this.apiBaseUrl}/search`
      );

      await this.cacheManager.set(cacheKey, response.data, this.cacheTTL);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Aqui você tem acesso a propriedades específicas do erro do Axios
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data?.message || 'Falha ao obter dados da API externa';

        throw new HttpException(message, statusCode);
      }

      throw new HttpException(
        'Falha ao obter dados da API externa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchByName(name: string): Promise<UniversityDto[]> {
    try {
      const cacheKey = `name_${name}`;
      const cachedData = await this.cacheManager.get<UniversityDto[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Tipagem explícita da resposta do axios
      const response: AxiosResponse<UniversityDto[]> = await axios.get(
        `${this.apiBaseUrl}/search`,
        {
          params: { name },
        }
      );

      await this.cacheManager.set(cacheKey, response.data, this.cacheTTL);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Aqui você tem acesso a propriedades específicas do erro do Axios
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data?.message || 'Falha ao obter dados da API externa';

        throw new HttpException(message, statusCode);
      }

      throw new HttpException(
        'Falha ao obter dados da API externa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchByCountry(country: string): Promise<UniversityDto[]> {
    try {
      const cacheKey = `country_${country}`;
      const cachedData = await this.cacheManager.get<UniversityDto[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Tipagem explícita da resposta do axios
      const response: AxiosResponse<UniversityDto[]> = await axios.get(
        `${this.apiBaseUrl}/search`,
        {
          params: { country },
        }
      );

      await this.cacheManager.set(cacheKey, response.data, this.cacheTTL);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Aqui você tem acesso a propriedades específicas do erro do Axios
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data?.message || 'Falha ao obter dados da API externa';

        throw new HttpException(message, statusCode);
      }

      throw new HttpException(
        'Falha ao obter dados da API externa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchByDomain(domain: string): Promise<UniversityDto[]> {
    try {
      const cacheKey = `domain_${domain}`;
      const cachedData = await this.cacheManager.get<UniversityDto[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Tipagem explícita da resposta do axios
      const response: AxiosResponse<UniversityDto[]> = await axios.get(
        `${this.apiBaseUrl}/search`,
        {
          params: { domain },
        }
      );

      await this.cacheManager.set(cacheKey, response.data, this.cacheTTL);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data?.message || 'Falha ao obter dados da API externa';

        throw new HttpException(message, statusCode);
      }

      throw new HttpException(
        'Falha ao obter dados da API externa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(query: SearchQueryDto): Promise<UniversityDto[]> {
    try {
      const queryParams = Object.entries(query)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}_${value}`)
        .join('_');

      const cacheKey = `search_${queryParams}`;
      const cachedData = await this.cacheManager.get<UniversityDto[]>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      // Tipagem explícita da resposta do axios
      const response: AxiosResponse<UniversityDto[]> = await axios.get(
        `${this.apiBaseUrl}/search`,
        {
          params: query,
        }
      );

      await this.cacheManager.set(cacheKey, response.data, this.cacheTTL);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Aqui você tem acesso a propriedades específicas do erro do Axios
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data?.message || 'Falha ao obter dados da API externa';

        throw new HttpException(message, statusCode);
      }

      throw new HttpException(
        'Falha ao obter dados da API externa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
