import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';

import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { MonitorsModule } from './monitors/monitors.module.js';
import { MonitorsController } from './monitors/monitors.controller.js';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';

import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

import { RequestTimingInterceptor } from './common/interceptors/request-timing.interceptor.js';
import { StatusModule } from './status/status.module.js';
import { ChecksModule } from './checks/checks.module.js';

@Module({
  imports: [MonitorsModule, StatusModule, ChecksModule],

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
