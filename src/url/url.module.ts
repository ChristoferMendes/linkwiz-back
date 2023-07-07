import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { InfraModule } from 'src/infra/infra.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from './schema/url.schema';

@Module({
  imports: [InfraModule],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
