import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: true,
  })
  url!: string;
}
