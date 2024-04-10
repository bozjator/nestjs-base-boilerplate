import { RoleHelper } from './role-helper';

export enum RoleSection {
  all = 'all',
  products = 'products',
  categories = 'categories',
}

/**
 * Maps RoleSection enum values to numeric identifiers.
 *
 * Key-value pairs represent the mapping of RoleSection enum values to their
 * corresponding numeric identifiers, needed for storing it into database as
 * numbers.
 */
const roleSectionMap: Map<RoleSection, number> = new Map([
  [RoleSection.all, 1],
  [RoleSection.products, 2],
  [RoleSection.categories, 3],
]);

export class RoleSectionHelper extends RoleHelper {
  static assertCompleteMapping = (): void =>
    super.assertCompleteMapping(
      'RoleSection',
      Object.values(RoleSection),
      roleSectionMap,
    );

  static getNumber = (enumValue: RoleSection | string): number =>
    super.enumToNumber(enumValue, roleSectionMap);

  static getName = (sectionNumber: number): RoleSection | null =>
    super.numberToEnum(sectionNumber, roleSectionMap);
}
RoleSectionHelper.assertCompleteMapping();
