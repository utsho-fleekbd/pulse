import { DrizzleModule } from '@nestjs/drizzle';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { MonitorsModule } from '../monitors/monitors.module.js';
import { MonitorsController } from '../monitors/monitors.controller.js';

import { RequestIdMiddleware } from '../common/middleware/request-id.middleware.js';

import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';

import { RequestTimingInterceptor } from '../common/interceptors/request-timing.interceptor.js';
import { StatusModule } from '../status/status.module.js';
import { ChecksModule } from '../checks/checks.module.js';
import { createDatabase } from '../database/db.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        db: createDatabase(config.getOrThrow<string>('DB_FILE_NAME')),
      }),
    }),

    ScheduleModule.forRoot(),

    MonitorsModule,
    StatusModule,
    ChecksModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTimingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes(MonitorsController);
  }
}
