import 'dotenv/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { type INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';


describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('login → me → logout → unauthorized', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/auth/login')
      .send({
        email: 'demo@example.com',
        password: 'demo1234',
      })
      .expect(201);

    const meResponse = await agent
      .get('/api/auth/me')
      .expect(200);

    expect(meResponse.body).toMatchObject({
      email: 'demo@example.com',
    });

    await agent
      .post('/api/auth/logout')
      .expect(201);

    await agent
      .get('/api/auth/me')
      .expect(401);
  });
});
