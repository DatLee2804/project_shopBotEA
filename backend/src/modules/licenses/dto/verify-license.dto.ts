import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyLicenseDto {
  @IsString()
  @IsNotEmpty()
  licenseKey: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  mtAccountNo?: string;

  @IsString()
  @IsOptional()
  botId?: string;

  @IsString()
  @IsOptional()
  indicatorId?: string;
}
