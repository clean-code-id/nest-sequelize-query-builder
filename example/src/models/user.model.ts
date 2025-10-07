import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './post.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  age: number;

  @HasMany(() => Post)
  posts: Post[];
}
