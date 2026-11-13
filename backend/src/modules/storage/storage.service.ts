import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'auto';
    const accessKeyId =
      process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey =
      process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

    this.s3Client = new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucketName =
      process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'ea-marketplace-files';
  }

  async uploadFile(
    fileBuffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    // Validate file extension (.ex4 / .ex5)
    const allowedExtensions = ['.ex4', '.ex5'];
    const extension = key.substring(key.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new HttpException(
        { errorCode: 'BOT_002', message: 'Định dạng file không hợp lệ (Chỉ chấp nhận .ex4 hoặc .ex5)' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return key;
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    // In dev / dummy mode, if no valid credentials, return a mock presigned link
    if (!process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID.includes('dummy') || process.env.S3_ACCESS_KEY_ID.includes('your-access-key')) {
      return `https://storage.oceanea.com/downloads/${key}?expires=${Date.now() + 60000}&token=demo-60s-presigned`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: 60 });
    } catch {
      return `https://storage.oceanea.com/downloads/${key}?expires=${Date.now() + 60000}&token=demo-60s-presigned`;
    }
  }
}
