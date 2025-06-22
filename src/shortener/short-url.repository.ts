import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShortUrl, ShortUrlDocument } from './entities/short-url.schema';

@Injectable()
export class ShortUrlRepository {
  constructor(@InjectModel(ShortUrl.name) private model: Model<ShortUrlDocument>) {}

  async create(
    originalUrl: string,
    shortCode: string,
    expiresAt: Date,
  ): Promise<ShortUrlDocument> {
    const created = await this.model.create({
      originalUrl,
      shortCode,
      createdAt: new Date(),
      accessCount: 0,
      expiresAt,
    });
    return created;
  }

  async findByCode(shortCode: string): Promise<ShortUrlDocument | null> {
    return this.model.findOne({ shortCode }).exec();
  }

  async incrementAccess(shortCode: string): Promise<void> {
    await this.model.updateOne({ shortCode }, { $inc: { accessCount: 1 } }).exec();
  }
}
