export class ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  accessCount?: number;

  constructor(partial: Partial<ShortUrl>) {
    Object.assign(this, partial);
  }
}
