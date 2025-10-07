import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { User } from './user/user.model';
import { Post } from './post/post.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seed some test data
  await seedData();

  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('\nTry these endpoints:');
  console.log('\n📄 Get ALL users:');
  console.log('  GET http://localhost:3000/users?sort=name');
  console.log('  GET http://localhost:3000/users?sort=-postCount');
  console.log('\n📄 Get paginated users (page size = 3):');
  console.log('  GET http://localhost:3000/users?sort=name&page=1');
  console.log('  GET http://localhost:3000/users?sort=-postCount&page=2');
}

async function seedData() {
  const userCount = await User.count();
  if (userCount > 0) return;

  console.log('Seeding database...');

  const users = await User.bulkCreate([
    { name: 'Alice Johnson', email: 'alice@example.com', age: 28 },
    { name: 'Aan Smith', email: 'bob@example.com', age: 34 },
    { name: 'Diana Brown', email: 'diana.1@example.com', age: 22 },
    { name: 'Diana Brown', email: 'diana.2@example.com', age: 31 },
    { name: 'Eve Wilson', email: 'eve@example.com', age: 26 },
    { name: 'Frank Miller', email: 'frank@example.com', age: 45 },
    { name: 'Grace Lee', email: 'grace@example.com', age: 29 },
    { name: 'Henry Davis', email: 'henry@example.com', age: 38 },
  ]);

  await Post.bulkCreate([
    { title: 'First Post', content: 'Content 1', likes: 10, userId: users[0].id },
    { title: 'Second Post', content: 'Content 2', likes: 25, userId: users[0].id },
    { title: 'Third Post', content: 'Content 3', likes: 5, userId: users[1].id },
    { title: 'Fourth Post', content: 'Content 4', likes: 50, userId: users[2].id },
    { title: 'Fifth Post', content: 'Content 5', likes: 15, userId: users[3].id },
  ]);

  console.log('Database seeded!');
}

bootstrap();
