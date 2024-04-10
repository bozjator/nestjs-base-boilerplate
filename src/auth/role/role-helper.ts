/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class RoleHelper {
  protected static assertCompleteMapping<T>(
    enumName: string,
    enumValues: T[],
    mapping: Map<T, number>,
  ): void {
    const mappedValues = Array.from(mapping.keys());
    const missingValues = enumValues.filter((v) => !mappedValues.includes(v));
    if (missingValues.length > 0)
      throw new Error(
        `Incomplete mapping for ${enumName} enum, missing values: ${missingValues.join(', ')}`,
      );

    const mappedNumbers = Array.from(mapping.values());
    const uniqueNumbers = new Set(mappedNumbers);
    if (mappedNumbers.length !== uniqueNumbers.size)
      throw new Error(`Duplicate numbers found in ${enumName} mapping`);
  }

  protected static enumToNumber<T>(
    enumValue: T,
    mapping: Map<T, number>,
  ): number {
    return mapping.get(enumValue) || 0;
  }

  protected static numberToEnum<T>(
    numberValue: number,
    mapping: Map<T, number>,
  ): T | null {
    return (
      Array.from(mapping.entries()).find(
        ([_, value]) => value === numberValue,
      )?.[0] || null
    );
  }
}
