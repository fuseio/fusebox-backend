import { isNumber } from "util";

import { IsEmail, IsNumberString, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    auth0_id: string;
}
