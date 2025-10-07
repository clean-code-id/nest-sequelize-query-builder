import { FindOptions, Model, ModelCtor, Order } from 'sequelize';
import { AllowedSort, ParsedSort, QueryBuilderConfig, QueryParams } from './types';
import { InvalidSortQueryException } from './exceptions/invalid-sort-query.exception';

export class QueryBuilder<M extends Model> {
  private model: ModelCtor<M>;
  private query: FindOptions<M>;
  private config: QueryBuilderConfig = {};
  private allowedSortsMap: Map<string, AllowedSort> = new Map();

  private constructor(model: ModelCtor<M>, query: FindOptions<M> = {}) {
    this.model = model;
    this.query = query;
  }

  /**
   * Create a new QueryBuilder instance
   */
  static for<M extends Model>(model: ModelCtor<M>, query: FindOptions<M> = {}): QueryBuilder<M> {
    return new QueryBuilder(model, query);
  }

  /**
   * Define allowed sorts
   */
  allowedSorts(...sorts: (string | AllowedSort)[]): this {
    this.config.allowedSorts = sorts;

    // Build map for quick lookup
    sorts.forEach((sort) => {
      if (typeof sort === 'string') {
        this.allowedSortsMap.set(sort, {
          name: sort,
          columnName: sort,
          isCustom: false,
        });
      } else {
        this.allowedSortsMap.set(sort.name, sort);
      }
    });

    return this;
  }

  /**
   * Define default sort
   */
  defaultSort(...sorts: string[]): this {
    this.config.defaultSort = sorts.length === 1 ? sorts[0] : sorts;
    return this;
  }

  /**
   * Apply sorting from query parameters
   */
  applySorts(params: QueryParams): this {
    const sortParam = params.sort;

    if (!sortParam && !this.config.defaultSort) {
      return this;
    }

    const sortsToApply = sortParam || this.config.defaultSort;
    if (!sortsToApply) {
      return this;
    }

    let sortStrings: string[];

    if (Array.isArray(sortsToApply)) {
      sortStrings = sortsToApply;
    } else if (typeof sortsToApply === 'string') {
      // Split by comma to support ?sort=name,-createdAt
      sortStrings = sortsToApply.includes(',')
        ? sortsToApply.split(',').map(s => s.trim())
        : [sortsToApply];
    } else {
      return this;
    }

    // Filter out any undefined values
    const validSortStrings = sortStrings.filter((s): s is string => typeof s === 'string' && s.length > 0);

    const parsedSorts = this.parseSorts(validSortStrings);
    this.validateSorts(parsedSorts);
    this.applyParsedSorts(parsedSorts);

    return this;
  }

  /**
   * Parse sort strings into field and direction
   */
  private parseSorts(sorts: string[]): ParsedSort[] {
    return sorts.map((sort) => {
      const isDescending = sort.startsWith('-');
      const field = isDescending ? sort.substring(1) : sort;

      return {
        field,
        direction: isDescending ? 'DESC' : 'ASC',
      };
    });
  }

  /**
   * Validate that all requested sorts are allowed
   */
  private validateSorts(parsedSorts: ParsedSort[]): void {
    if (this.allowedSortsMap.size === 0) {
      return; // No validation if no allowed sorts defined
    }

    const unknownSorts = parsedSorts
      .filter((sort) => !this.allowedSortsMap.has(sort.field))
      .map((sort) => sort.field);

    if (unknownSorts.length > 0) {
      const allowedSortNames = Array.from(this.allowedSortsMap.keys());
      throw new InvalidSortQueryException(unknownSorts, allowedSortNames);
    }
  }

  /**
   * Apply parsed sorts to the query
   */
  private applyParsedSorts(parsedSorts: ParsedSort[]): void {
    const order: any[] = [];

    for (const parsedSort of parsedSorts) {
      const allowedSort = this.allowedSortsMap.get(parsedSort.field);

      if (allowedSort?.isCustom && allowedSort.customSort) {
        // Apply custom sort logic
        this.query = allowedSort.customSort(this.query, parsedSort.direction);
      } else {
        // Apply standard column sort
        const columnName = allowedSort?.columnName || parsedSort.field;
        order.push([columnName, parsedSort.direction]);
      }
    }

    if (order.length > 0) {
      const existingOrder = this.query.order as any[] || [];
      this.query.order = [...existingOrder, ...order] as Order;
    }
  }

  /**
   * Get the built Sequelize query options
   */
  build(): FindOptions<M> {
    return this.query;
  }

  /**
   * Execute the query and return results
   */
  async get(): Promise<M[]> {
    return this.model.findAll(this.query);
  }

  /**
   * Execute the query and return paginated results
   */
  async paginate(page: number = 1, perPage: number = 15): Promise<{ data: M[]; total: number; page: number; perPage: number }> {
    const offset = (page - 1) * perPage;

    const { count, rows } = await this.model.findAndCountAll({
      ...this.query,
      limit: perPage,
      offset,
    });

    return {
      data: rows,
      total: count,
      page,
      perPage,
    };
  }

  /**
   * Execute the query and return the first result
   */
  async first(): Promise<M | null> {
    return this.model.findOne(this.query);
  }
}
