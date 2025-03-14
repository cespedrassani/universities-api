import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Offset atual (número de registros pulados)' })
  offset: number;

  @ApiProperty({ description: 'Número de itens por página' })
  limit: number;

  @ApiProperty({ description: 'Total de itens disponíveis' })
  totalItems: number;

  @ApiProperty({ description: 'Indica se há mais itens disponíveis' })
  hasMore: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Lista de itens na página atual' })
  items: T[];

  @ApiProperty({ description: 'Metadados da paginação' })
  meta: PaginationMeta;

  constructor(items: T[], meta: PaginationMeta) {
    this.items = items;
    this.meta = meta;
  }

  static create<T>(
    items: T[],
    totalItems: number,
    offset: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    const hasMore = offset + items.length < totalItems;

    const meta: PaginationMeta = {
      offset,
      limit,
      totalItems,
      hasMore,
    };

    return new PaginatedResponseDto<T>(items, meta);
  }
}
