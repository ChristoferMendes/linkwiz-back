import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url, UrlDocument } from './schema/url.schema';
import { Model } from 'mongoose';
import * as CRC from 'crc-32';
import { tryCatchPromise } from 'safe-catch';
import { NotFoundError } from 'src/shared/errors/NotFoundError';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Today } from 'src/shared/errors/date';
import * as moment from 'moment';
import { Click, DayStats, WeekStats } from './types';

@Injectable()
export class UrlService {
  @Today()
  today: string;

  constructor(@InjectModel(Url.name) private urlModel: Model<UrlDocument>) {}

  async getFavIcon(domain: string) {
    const url = `https://www.google.com/s2/favicons?domain=${domain}`;

    const favIconImageResponse = await fetch(url);

    const favIconBuffer = Buffer.from(await favIconImageResponse.arrayBuffer());

    const base64 = favIconBuffer.toString('base64');

    const base64Formatted = `data:image/png;base64,${base64}`;

    return {
      favIcon: base64Formatted,
    };
  }

  async findAllByIds(ids: string[]) {
    const urls = await this.urlModel.find({ _id: { $in: ids } });

    return urls;
  }

  async create(createShortUrlDto: CreateShortUrlDto) {
    const { url } = createShortUrlDto;

    const { shortUrl: shortUrlAlreadyCreated } =
      (await this._findOneByFullUrl(url)) ?? {};

    if (shortUrlAlreadyCreated) return shortUrlAlreadyCreated;

    const shortUrl = this._shrink(url);

    const createdUrl = new this.urlModel({ fullUrl: url, shortUrl });
    await createdUrl.save();

    return createdUrl;
  }

  async find(shortUrl: string) {
    const url = await this.urlModel.findOne({ shortUrl });

    if (!url) throw new NotFoundError('Url not found');

    url.clicks++;

    const currentDate = this.today;

    const lastClick = url.clickHistory.find(
      (click) => click.date === currentDate,
    );

    url.lastClickDate = currentDate;

    if (!lastClick) {
      url.clickHistory.push({ date: currentDate, count: 1 });
      url.save();
      return url;
    }

    lastClick.count++;
    url.markModified('clickHistory');
    url.save();
    return url;
  }

  async getClicksByWeeks(linkId: string, year: number, month: number) {
    const startOfMonth = moment()
      .year(year)
      .month(month - 1)
      .date(1);

    const endOfMonth = startOfMonth.clone().endOf('month');

    const url = await this.urlModel.findById(linkId);
    if (!url) {
      return [];
    }

    const weeks: WeekStats[] = [];
    const currentWeekStart = startOfMonth.clone().startOf('isoWeek');
    let weekContinues = currentWeekStart.isSameOrBefore(endOfMonth);

    while (weekContinues) {
      const days: DayStats[] = [];
      let totalCount = 0;

      const DAYS_OF_WEEK = 7;

      for (let dayIndex = 0; dayIndex < DAYS_OF_WEEK; dayIndex++) {
        const currentDate = currentWeekStart.clone().add(dayIndex, 'days');

        const isSameMonth = currentDate.isSame(startOfMonth, 'month');
        const isBeforeEndOfMonth = currentDate.isSameOrBefore(endOfMonth);

        if (!isSameMonth && isBeforeEndOfMonth) continue;

        const formattedDay = currentDate.toISOString().slice(0, 10);
        const clicksOnDay = this.getCountForDay(url.clickHistory, formattedDay);

        days.push({ day: formattedDay, count: clicksOnDay });
        totalCount += clicksOnDay;
      }

      weeks.push({
        week: currentWeekStart.isoWeek(),
        count: totalCount,
        days,
      });

      currentWeekStart.add(1, 'week');
      weekContinues = currentWeekStart.isSameOrBefore(endOfMonth);
    }

    return weeks;
  }

  private getCountForDay(clickHistory: Click[], formattedDay: string): number {
    return clickHistory.reduce((acc, click) => {
      const clickDay = moment(click.date).format('YYYY-MM-DD');
      if (clickDay === formattedDay) {
        return acc + click.count;
      }
      return acc;
    }, 0);
  }

  private async _findOneByFullUrl(fullUrl: string) {
    const [data, error] = await tryCatchPromise<UrlDocument, Error>(
      this.urlModel.findOne({ url: fullUrl }),
    );

    if (error) throw new Error(error.message);

    return data;
  }

  private _shrink(url: string) {
    const hash = CRC.str(url);
    const encoded = hash.toString(16);
    return encoded;
  }
}
