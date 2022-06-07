import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { AxiosRequestConfig } from 'axios'
import { lastValueFrom, map } from 'rxjs'
import * as CryptoJS from 'crypto-js'

@Injectable()
export class StudioLegacyJwtService {
  constructor (private httpService: HttpService) { }

  async createLegacyJwt (
    appName = 'chargeApp'
  ): Promise<string> {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FUSE_STUDIO_ADMIN_JWT}`
      }
    }

    const requestBody = {
      role: 'communityAdmin',
      bridgeType: 'home',
      description: appName,
      appName
    }

    const responseData = await lastValueFrom(
      this.httpService
        .post(
                    `${process.env.FUSE_STUDIO_ACCOUNTS_API_URL}`,
                    requestBody,
                    requestConfig
        )
        .pipe(
          map((response) => {
            return response.data
          })
        )
    )

    console.log(JSON.stringify(responseData))
    console.log(typeof (responseData?.data?.jwt))

    const legacyJwt = responseData?.data?.jwt

    const encryptedLegacyJwt = CryptoJS.AES.encrypt(legacyJwt, process.env.LEGACY_JWT_SECRET)

    return encryptedLegacyJwt.toString()
  }

  // To be used internally when requests will be forwarded to the Legacy Admin API
  async decryptEncryptedJWT (encryptedJwt: string): Promise<string> {
    const decrypted = CryptoJS.AES.decrypt(encryptedJwt, process.env.LEGACY_JWT_SECRET)

    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}
