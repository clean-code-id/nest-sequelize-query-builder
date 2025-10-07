import { AllowedSort as IAllowedSort } from '../types';

export class AllowedSort {
  /**
   * Create a simple field sort
   */
  static field(name: string, columnName?: string): IAllowedSort {
    return {
      name,
      columnName: columnName || name,
      isCustom: false,
    };
  }

  /**
   * Create a custom sort with custom logic
   */
  static custom(
    name: string,
    customSort: (query: any, direction: 'ASC' | 'DESC') => any,
  ): IAllowedSort {
    return {
      name,
      isCustom: true,
      customSort,
    };
  }

  /**
   * Create multiple field sorts
   */
  static fields(...names: string[]): IAllowedSort[] {
    return names.map((name) => AllowedSort.field(name));
  }
}
