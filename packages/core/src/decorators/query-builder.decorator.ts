import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract query parameters for QueryBuilder
 * Usage: @QueryBuilderParams() params: QueryParams
 */
export const QueryBuilderParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.query;
  },
);
