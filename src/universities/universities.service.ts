import { Injectable, Logger } from '@nestjs/common';
import { UniversitiesDto, SearchQueryDto } from './dto/universities.dto';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';
import { PaginationUtils } from '../common/utils/pagination.utils';
import { ApiClient } from '../common/services/api-client.service';
import { CacheService } from '../common/services/cache.service';
import { ErrorHandlerService } from '../common/services/error-handler.service';

@Injectable()
export class UniversitiesService {
  private readonly logger = new Logger(UniversitiesService.name);

  constructor(
    private readonly apiClient: ApiClient,
    private readonly cacheService: CacheService,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async findAll(offset: number = 0, limit: number = 10): Promise<PaginatedResponseDto<UniversitiesDto>> {
    try {
      const cacheKey = this.cacheService.getAllKey(offset, limit);
      const cachedData = await this.cacheService.get<PaginatedResponseDto<UniversitiesDto>>(cacheKey);

      if (cachedData) {
        this.logger.log(`Dados paginados obtidos do cache: ${cacheKey}`);
        return cachedData;
      }

      const params = { offset, limit };

      const universities = await this.apiClient.callApi<UniversitiesDto[]>('/search', params);

      const hasMoreParams = PaginationUtils.getHasMoreParams(params, offset, limit);
      const moreItems = await this.apiClient.callApi<UniversitiesDto[]>('/search', hasMoreParams);

      const totalItems = PaginationUtils.calculateTotalItems(universities, moreItems, offset, limit);
      const result = PaginationUtils.createPaginatedResponse(universities, totalItems, offset, limit);

      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.errorHandler.handleApiError(error);
    }
  }

  async searchByName(name: string, offset: number = 0, limit: number = 10): Promise<PaginatedResponseDto<UniversitiesDto>> {
    try {
      const cacheKey = this.cacheService.getByNameKey(name, offset, limit);
      const cachedData = await this.cacheService.get<PaginatedResponseDto<UniversitiesDto>>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const params = { name, offset, limit };

      const universities = await this.apiClient.callApi<UniversitiesDto[]>('/search', params);

      const hasMoreParams = PaginationUtils.getHasMoreParams(params, offset, limit);
      const moreItems = await this.apiClient.callApi<UniversitiesDto[]>('/search', hasMoreParams);

      const totalItems = PaginationUtils.calculateTotalItems(universities, moreItems, offset, limit);
      const result = PaginationUtils.createPaginatedResponse(universities, totalItems, offset, limit);

      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.errorHandler.handleApiError(error);
    }
  }

  async searchByCountry(country: string, offset: number = 0, limit: number = 10): Promise<PaginatedResponseDto<UniversitiesDto>> {
    try {
      const cacheKey = this.cacheService.getByCountryKey(country, offset, limit);
      const cachedData = await this.cacheService.get<PaginatedResponseDto<UniversitiesDto>>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const params = { country, offset, limit };

      const universities = await this.apiClient.callApi<UniversitiesDto[]>('/search', params);

      const hasMoreParams = PaginationUtils.getHasMoreParams(params, offset, limit);
      const moreItems = await this.apiClient.callApi<UniversitiesDto[]>('/search', hasMoreParams);

      const totalItems = PaginationUtils.calculateTotalItems(universities, moreItems, offset, limit);
      const result = PaginationUtils.createPaginatedResponse(universities, totalItems, offset, limit);

      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.errorHandler.handleApiError(error);
    }
  }

  async searchByDomain(domain: string, offset: number = 0, limit: number = 10): Promise<PaginatedResponseDto<UniversitiesDto>> {
    try {
      const cacheKey = this.cacheService.getByDomainKey(domain, offset, limit);
      const cachedData = await this.cacheService.get<PaginatedResponseDto<UniversitiesDto>>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const params = { domain, offset, limit };

      const universities = await this.apiClient.callApi<UniversitiesDto[]>('/search', params);

      const hasMoreParams = PaginationUtils.getHasMoreParams(params, offset, limit);
      const moreItems = await this.apiClient.callApi<UniversitiesDto[]>('/search', hasMoreParams);

      const totalItems = PaginationUtils.calculateTotalItems(universities, moreItems, offset, limit);
      const result = PaginationUtils.createPaginatedResponse(universities, totalItems, offset, limit);

      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.errorHandler.handleApiError(error);
    }
  }

  async search(query: SearchQueryDto): Promise<PaginatedResponseDto<UniversitiesDto>> {
    try {
      const { offset = 0, limit = 10, ...searchParams } = query;

      const cacheKey = this.cacheService.getSearchKey(searchParams, offset, limit);
      const cachedData = await this.cacheService.get<PaginatedResponseDto<UniversitiesDto>>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const params = { ...searchParams, offset, limit };

      const universities = await this.apiClient.callApi<UniversitiesDto[]>('/search', params);

      const hasMoreParams = PaginationUtils.getHasMoreParams(params, offset, limit);
      const moreItems = await this.apiClient.callApi<UniversitiesDto[]>('/search', hasMoreParams);

      const totalItems = PaginationUtils.calculateTotalItems(universities, moreItems, offset, limit);
      const result = PaginationUtils.createPaginatedResponse(universities, totalItems, offset, limit);

      await this.cacheService.set(cacheKey, result);

      return result;
    } catch (error) {
      return this.errorHandler.handleApiError(error);
    }
  }
}
