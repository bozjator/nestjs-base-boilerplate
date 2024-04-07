import { ApiPropertyEnum } from 'src/shared/decorators/api-property-enum.decorator';
import { RoleSection } from 'src/auth/models/role-section.enum';
import { RolePermission } from 'src/auth/models/role-permission.enum';

export class RoleToAdd {
  @ApiPropertyEnum(RoleSection, 'section')
  section: string;

  @ApiPropertyEnum(RolePermission, 'permission')
  permission: string;
}
