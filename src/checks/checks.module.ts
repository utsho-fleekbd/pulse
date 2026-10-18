import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { ChecksService } from './checks.service.js';

@Module({
  imports: [
    HttpClientModule.register({
      timeout: '3s',
      retry: false,
      redirect: 'error',
      throwOnHttpError: false,
    }),
  ],
  providers: [ChecksService],
  exports: [ChecksService],
})
export class ChecksModule {}
