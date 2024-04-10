import { ApiPropertyEnum } from 'src/shared/decorators/api-property-enum.decorator';
import { RoleSection } from 'src/auth/role/role-section';
import { RolePermission } from 'src/auth/role/role-permission';

export class RoleToSet {
  @ApiPropertyEnum(RoleSection, 'section')
  section: string;

  @ApiPropertyEnum(RolePermission, 'permission')
  permission: string;
}
