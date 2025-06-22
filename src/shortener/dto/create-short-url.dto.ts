import { IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl({}, { message: 'url must be a valid URL' })
  url!: string;
}
