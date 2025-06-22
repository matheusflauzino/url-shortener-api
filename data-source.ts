import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DB || 'url_shortener',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});

export default AppDataSource;
