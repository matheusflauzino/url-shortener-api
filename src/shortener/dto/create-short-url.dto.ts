import { IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl({}, { message: 'Invalid URL' })
  url: string;
}
