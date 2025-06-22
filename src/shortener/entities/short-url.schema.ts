import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ShortUrl {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true, unique: true })
  shortCode: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  accessCount?: number;

  @Prop()
  userId: number;
}

export type ShortUrlDocument = ShortUrl & Document;

export const ShortUrlSchema = SchemaFactory.createForClass(ShortUrl);
