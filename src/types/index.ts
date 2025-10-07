import { Order, OrderItem } from 'sequelize';

export interface AllowedSort {
  name: string;
  columnName?: string;
  isCustom?: boolean;
  customSort?: (query: any, direction: 'ASC' | 'DESC') => any;
}

export interface QueryBuilderConfig {
  defaultSort?: string | string[];
  allowedSorts?: (string | AllowedSort)[];
}

export interface ParsedSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface QueryParams {
  sort?: string | string[];
  [key: string]: any;
}
