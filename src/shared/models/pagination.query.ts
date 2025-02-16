import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Max, Min } from 'class-validator';
import { ApiPropertyEnum } from '../decorators/api-property-enum.decorator';
import { SortOrder } from './sort-order.enum';

export class PaginationQuery {
  @IsNotEmpty()
  @Min(1)
  @ApiProperty()
  pageNumber: number;

  @IsNotEmpty()
  @Min(1)
  @Max(200)
  @ApiProperty()
  pageItems: number;

  @ApiPropertyEnum(SortOrder, 'sortOrder')
  sortOrder: SortOrder;
}
