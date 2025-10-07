import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from './post.model';

@Module({
  imports: [SequelizeModule.forFeature([Post])],
  exports: [SequelizeModule],
})
export class PostModule {}
