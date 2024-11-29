import { IsEmail, IsString } from "class-validator"

export class loginUserDTO{
    @IsString()
    @IsEmail()
    readonly email:string
    @IsString()
    readonly password: string
}