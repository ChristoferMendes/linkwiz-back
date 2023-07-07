import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get(':shortUrl')
  async redirectToFullUrl(@Res() res: Response) {
    const { shortUrl } = res.req.params;
    return res.redirect(`/url/unshrink/${shortUrl}`);
  }
}
