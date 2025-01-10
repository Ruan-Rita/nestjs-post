import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from 'src/post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { AppModule } from 'src/app.module';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        PostModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: 5432,
          database: process.env.DB_DATABASE_TESTING,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          autoLoadEntities: true,
          synchronize: true, // disable this feature when it will deploy
          dropSchema: true,
        }),
        UserModule,
        AuthModule,
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        // transform: true, ParseIntPipe
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello Wor2ld!');
  });

  it('/user (POST)', async () => {
    const user: Partial<CreateUserDto> = {
      name: 'ruan rita',
      cpf: '484821121231321',
      email: 'ruan@gmail.com',
      routePolicies: [],
    };

    const result = await request(app.getHttpServer())
      .post('/user')
      .send({ ...user, password: '12213123' })
      .expect(201);

    expect(result.body).toMatchObject({
      message: 'Registered successfully',
      data: {
        user: user,
      },
    });
  });
});
