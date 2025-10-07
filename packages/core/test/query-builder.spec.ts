import { QueryBuilder } from '../src/query-builder';
import { AllowedSort } from '../src/sorts/allowed-sort';
import { InvalidSortQueryException } from '../src/exceptions/invalid-sort-query.exception';
import { Model, ModelCtor } from 'sequelize';

// Mock Sequelize Model
class MockModel extends Model {
  static findAll = jest.fn();
  static findOne = jest.fn();
  static findAndCountAll = jest.fn();
}

describe('QueryBuilder', () => {
  let mockModel: ModelCtor<MockModel>;

  beforeEach(() => {
    mockModel = MockModel as any;
    jest.clearAllMocks();
  });

  describe('Basic Sorting', () => {
    it('should apply ascending sort', () => {
      const query = QueryBuilder.for(mockModel)
        .allowedSorts('name')
        .applySorts({ sort: 'name' })
        .build();

      expect(query.order).toEqual([['name', 'ASC']]);
    });

    it('should apply descending sort', () => {
      const query = QueryBuilder.for(mockModel)
        .allowedSorts('name')
        .applySorts({ sort: '-name' })
        .build();

      expect(query.order).toEqual([['name', 'DESC']]);
    });

    it('should apply multiple sorts', () => {
      const query = QueryBuilder.for(mockModel)
        .allowedSorts('name', 'email')
        .applySorts({ sort: ['name', '-email'] })
        .build();

      expect(query.order).toEqual([
        ['name', 'ASC'],
        ['email', 'DESC'],
      ]);
    });

    it('should handle comma-separated sorts as array', () => {
      const query = QueryBuilder.for(mockModel)
        .allowedSorts('name', 'age')
        .applySorts({ sort: 'name,-age' })
        .build();

      expect(query.order).toEqual([
        ['name', 'ASC'],
        ['age', 'DESC'],
      ]);
    });
  });

  describe('Default Sorting', () => {
    it('should apply default sort when no sort param provided', () => {
      const query = QueryBuilder.for(mockModel)
        .defaultSort('name')
        .allowedSorts('name', 'email')
        .applySorts({})
        .build();

      expect(query.order).toEqual([['name', 'ASC']]);
    });

    it('should override default sort with query param', () => {
      const query = QueryBuilder.for(mockModel)
        .defaultSort('name')
        .allowedSorts('name', 'email')
        .applySorts({ sort: 'email' })
        .build();

      expect(query.order).toEqual([['email', 'ASC']]);
    });

    it('should support multiple default sorts', () => {
      const query = QueryBuilder.for(mockModel)
        .defaultSort('-createdAt', 'name')
        .allowedSorts('name', 'createdAt')
        .applySorts({})
        .build();

      expect(query.order).toEqual([
        ['createdAt', 'DESC'],
        ['name', 'ASC'],
      ]);
    });
  });

  describe('Sort Validation', () => {
    it('should throw error for non-allowed sort', () => {
      expect(() => {
        QueryBuilder.for(mockModel)
          .allowedSorts('name')
          .applySorts({ sort: 'email' })
          .build();
      }).toThrow(InvalidSortQueryException);
    });

    it('should throw error with multiple non-allowed sorts', () => {
      expect(() => {
        QueryBuilder.for(mockModel)
          .allowedSorts('name')
          .applySorts({ sort: ['email', 'age'] })
          .build();
      }).toThrow(InvalidSortQueryException);
    });

    it('should allow any sort when no allowedSorts defined', () => {
      const query = QueryBuilder.for(mockModel)
        .applySorts({ sort: 'anything' })
        .build();

      expect(query.order).toEqual([['anything', 'ASC']]);
    });
  });

  describe('Sort Aliases', () => {
    it('should map sort name to different column', () => {
      const query = QueryBuilder.for(mockModel)
        .allowedSorts(AllowedSort.field('email', 'email_address'))
        .applySorts({ sort: 'email' })
        .build();

      expect(query.order).toEqual([['email_address', 'ASC']]);
    });

    it('should support mix of string and AllowedSort', () => {
      const query = QueryBuilder.for(mockModel)
        .allowedSorts('name', AllowedSort.field('email', 'email_address'))
        .applySorts({ sort: ['name', '-email'] })
        .build();

      expect(query.order).toEqual([
        ['name', 'ASC'],
        ['email_address', 'DESC'],
      ]);
    });
  });

  describe('Custom Sorts', () => {
    it('should apply custom sort logic', () => {
      const customSortFn = jest.fn((query, direction) => ({
        ...query,
        order: [['custom_field', direction]],
      }));

      const query = QueryBuilder.for(mockModel)
        .allowedSorts(AllowedSort.custom('custom', customSortFn))
        .applySorts({ sort: 'custom' })
        .build();

      expect(customSortFn).toHaveBeenCalledWith(expect.any(Object), 'ASC');
      expect(query.order).toEqual([['custom_field', 'ASC']]);
    });

    it('should pass correct direction to custom sort', () => {
      const customSortFn = jest.fn((query, direction) => query);

      QueryBuilder.for(mockModel)
        .allowedSorts(AllowedSort.custom('custom', customSortFn))
        .applySorts({ sort: '-custom' })
        .build();

      expect(customSortFn).toHaveBeenCalledWith(expect.any(Object), 'DESC');
    });
  });

  describe('Query Execution', () => {
    it('should call findAll when get() is called', async () => {
      MockModel.findAll.mockResolvedValue([]);

      await QueryBuilder.for(mockModel)
        .allowedSorts('name')
        .applySorts({ sort: 'name' })
        .get();

      expect(MockModel.findAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
    });

    it('should call findOne when first() is called', async () => {
      MockModel.findOne.mockResolvedValue(null);

      await QueryBuilder.for(mockModel)
        .allowedSorts('name')
        .applySorts({ sort: 'name' })
        .first();

      expect(MockModel.findOne).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
    });

    it('should call findAndCountAll when paginate() is called', async () => {
      MockModel.findAndCountAll.mockResolvedValue({ count: 10, rows: [] });

      const result = await QueryBuilder.for(mockModel)
        .allowedSorts('name')
        .applySorts({ sort: 'name' })
        .paginate(2, 5);

      expect(MockModel.findAndCountAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
        limit: 5,
        offset: 5,
      });

      expect(result).toEqual({
        data: [],
        total: 10,
        page: 2,
        perPage: 5,
      });
    });
  });

  describe('AllowedSort Helpers', () => {
    it('should create field sort', () => {
      const sort = AllowedSort.field('name');
      expect(sort).toEqual({
        name: 'name',
        columnName: 'name',
        isCustom: false,
      });
    });

    it('should create field sort with alias', () => {
      const sort = AllowedSort.field('email', 'email_address');
      expect(sort).toEqual({
        name: 'email',
        columnName: 'email_address',
        isCustom: false,
      });
    });

    it('should create custom sort', () => {
      const fn = jest.fn();
      const sort = AllowedSort.custom('custom', fn);
      expect(sort).toEqual({
        name: 'custom',
        isCustom: true,
        customSort: fn,
      });
    });

    it('should create multiple field sorts', () => {
      const sorts = AllowedSort.fields('name', 'email', 'age');
      expect(sorts).toHaveLength(3);
      expect(sorts[0]).toEqual({
        name: 'name',
        columnName: 'name',
        isCustom: false,
      });
    });
  });
});
