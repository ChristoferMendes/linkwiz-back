import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Url extends Document {
  @Prop()
  fullUrl: string;

  @Prop()
  shortUrl: string;

  @Prop({ default: 0 })
  clicks: number;

  @Prop()
  clickHistory: {
    date: string;
    count: number;
  }[];

  @Prop()
  lastClickDate: string;
}

export const UrlSchema = SchemaFactory.createForClass(Url);

export type UrlDocument = Url & Document;
