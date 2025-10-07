import { Controller, Get } from '@nestjs/common';
import { QueryBuilder, QueryBuilderParams, AllowedSort } from 'nest-sequelize-query-builder';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';

@Controller('users')
export class UsersController {
  /**
   * Basic sorting example
   * Try: GET /users?sort=name
   *      GET /users?sort=-name
   *      GET /users?sort=name,-createdAt
   */
  @Get()
  async index(@QueryBuilderParams() params: any) {
    // Build base query with Post included
    const baseQuery = {
      include: [
        {
          model: Post,
          as: 'posts',
        },
      ],
    };

    return QueryBuilder.for(User, baseQuery)
      .allowedSorts('name', 'email', 'age', 'createdAt')
      .applySorts(params)
      .get();
  }
}
