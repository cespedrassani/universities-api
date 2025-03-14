import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

export class PaginationUtils {
  static calculateTotalItems(
    items: any[],
    moreItems: any[],
    offset: number,
    limit: number,
  ): number {
    return moreItems.length > 0
      ? offset + limit + moreItems.length
      : offset + items.length;
  }

  static createPaginatedResponse(
    items: any[],
    totalItems: number,
    offset: number,
    limit: number,
  ): PaginatedResponseDto<any> {
    return PaginatedResponseDto.create(
      items,
      totalItems,
      offset,
      limit,
    );
  }

  static getHasMoreParams(
    params: Record<string, any>,
    offset: number,
    limit: number,
  ): Record<string, any> {
    return { ...params, offset: offset + limit, limit: 1 };
  }
}
