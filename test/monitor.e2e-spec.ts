import type { Server } from 'node:http';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

describe('Monitors API', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      }),
    );

    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates and retrieves a monitor', async () => {
    const response = await request(server)
      .post('/monitors')
      .send({
        name: 'Example',
        url: 'https://example.com',
      })
      .expect(201);

    const body: unknown = response.body;

    // Narrow unknown data before accessing its properties.
    if (
      typeof body !== 'object' ||
      body === null ||
      !('id' in body) ||
      typeof body.id !== 'string'
    ) {
      throw new Error('Expected a monitor with an ID');
    }

    expect(body).toMatchObject({
      name: 'Example',
      url: 'https://example.com',
      status: 'pending',
    });

    const getResponse = await request(server)
      .get(`/monitors/${body.id}`)
      .expect(200);

    const fetched: unknown = getResponse.body;

    expect(fetched).toEqual(body);
  });

  it('rejects invalid request bodies', async () => {
    await request(server)
      .post('/monitors')
      .send({
        name: 123,
        url: 'invalid-url',
      })
      .expect(400);
  });

  it('rejects unexpected request properties', async () => {
    await request(server)
      .post('/monitors')
      .send({
        name: 'Example',
        url: 'https://example.com',
        status: 'up',
      })
      .expect(400);
  });

  it('rejects malformed UUIDs', async () => {
    await request(server).get('/monitors/invalid-id').expect(400);
  });

  it('filters monitors by status', async () => {
    const response = await request(server)
      .get('/monitors?status=up')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('returns a standardized validation error', async () => {
    const response = await request(server)
      .get('/monitors?status=offline')
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'status must be pending, up, or down',
      path: '/monitors?status=offline',
    });
  });

  it('includes request ID and timing headers', async () => {
    const first = await request(server).get('/monitors').expect(200);

    const second = await request(server).get('/monitors').expect(200);

    const firstId: unknown = first.headers['x-request-id'];

    const secondId: unknown = second.headers['x-request-id'];

    const timing: unknown = first.headers['x-response-time'];

    expect(typeof firstId).toBe('string');
    expect(typeof secondId).toBe('string');
    expect(firstId).not.toBe(secondId);

    expect(timing).toEqual(expect.stringMatching(/^\d+(\.\d+)?ms$/));
  });
});
