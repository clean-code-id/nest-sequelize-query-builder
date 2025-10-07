import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { User } from './user/user.model';
import { Post } from './post/post.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [User, Post],
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    UserModule,
    PostModule,
  ],
})
export class AppModule {}
