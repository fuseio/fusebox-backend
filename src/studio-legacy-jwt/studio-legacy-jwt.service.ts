import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, map, Observable } from 'rxjs';

@Injectable()
export class StudioLegacyJwtService {
  constructor(private httpService: HttpService) {}

  async create(
    appName = 'chargeApp',
  ): Promise<Observable<AxiosResponse<string>>> {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
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
