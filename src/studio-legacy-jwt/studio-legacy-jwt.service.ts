import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, map, Observable } from 'rxjs';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class StudioLegacyJwtService {
  constructor(private httpService: HttpService) {}

  async create(
    appName = 'testApp',
  ): Promise<Observable<AxiosResponse<string>>> {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json', // afaik this one is not needed
        Authorization: `Bearer ${process.env.FUSE_STUDIO_ADMIN_JWT}`,
      },
    };

    const requestBody = {
      role: 'communityAdmin',
      bridgeType: 'home',
      description: 'charge',
      appName: appName,
    };

    const responseData = await lastValueFrom(
      this.httpService
        .post(
          `${process.env.FUSE_STUDIO_ACCOUNTS_API_URL}`,
          requestBody,
          requestConfig,
        )
        .pipe(
          map((response) => {
            return response.data;
          }),
        ),
    );

    return responseData;
  }
}
