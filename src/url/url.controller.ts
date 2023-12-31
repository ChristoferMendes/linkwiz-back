import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/short')
  createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto) {
    return this.urlService.create(createShortUrlDto);
  }

  @Get('/:domain/favIcon')
  async getFavIcon(@Param('domain') domain: string) {
    return this.urlService.getFavIcon(domain);
  }

  @Get('findAll')
  findAll(@Query('ids') ids: string[]) {
    return this.urlService.findAllByIds(ids);
  }

  @SkipThrottle()
  @Get('/unshrink/:shortUrl')
  async redirectToUnshrinkUrl(@Param('shortUrl') shortUrl: string) {
    const url = await this.urlService.find(shortUrl);

    return url;
  }

  @Get(':id/:year/:month')
  getClicksByWeek(
    @Param('id') id: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.urlService.getClicksByWeeks(id, year, month);
  }
}
