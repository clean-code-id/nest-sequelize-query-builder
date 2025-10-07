import { Controller, Get } from "@nestjs/common";
import {
  QueryBuilder,
  QueryBuilderParams,
  AllowedSort,
} from "@cleancode-id/nestjs-query-builder";
import { User } from "./user.model";
import { Post } from "../post/post.model";
import { Sequelize } from "sequelize-typescript";
import { FindOptions } from "sequelize";

@Controller("users")
export class UserController {
  /**
   * Users list with optional pagination and sorting
   *
   * Get ALL users:
   *   GET /users?sort=name
   *   GET /users?sort=-postCount
   *
   * Get paginated users (page size = 3):
   *   GET /users?sort=name&page=1
   *   GET /users?sort=-postCount&page=2
   */
  @Get()
  async index(@QueryBuilderParams() params: any) {
    try {
      // Build base query with Post included
      const baseQuery: FindOptions<User> = {
      include: [
        {
          model: Post,
          as: "posts",
        },
      ],
      attributes: {
        include: [
          // Add postCount as a virtual column
          [Sequelize.fn("COUNT", Sequelize.col("posts.id")), "postCount"],
        ],
      } as any, // Type assertion needed for complex attributes
      group: ["User.id"],
      subQuery: false,
    };

    const queryBuilder = QueryBuilder.for(User, baseQuery)
      .allowedSorts(
        "name",
        "email",
        "age",
        "createdAt",
        AllowedSort.custom("postCount", (query, direction) => {
          // Sort by the aggregated postCount
          return {
            ...query,
            order: [[Sequelize.literal("postCount"), direction]],
          };
        })
      )
      .applySorts(params);

    // If page param exists, return paginated results
    if (params.page) {
      const page = parseInt(params.page);
      const perPage = 3;
      return queryBuilder.paginate(page, perPage);
    }

      // Otherwise, return all results
      return queryBuilder.get();
    } catch (error) {
      const { BadRequestException } = require('@nestjs/common');
      console.log('Error instanceof BadRequestException?', error instanceof BadRequestException);
      console.log('Error constructor:', error.constructor.name);
      console.log('Error has getStatus?', typeof error.getStatus);
      if (error.getStatus) {
        console.log('Status:', error.getStatus());
      }
      throw error;
    }
  }
}
