import { Body, Controller, Get, Post, Put, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/createUserDTO';
import { userResponseInterface } from './types/userResponseInterface';
import { loginUserDTO } from './dto/loginUserDTO';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDTO } from './dto/updateUserDTO';
import { updateUserInterface } from './types/updateUser.interface';
import { BackendValidationPipe } from '@app/shared/BackendValidation.pipe';
import { Response } from 'express';


@Controller()
export class UserController {
    constructor(private readonly userService:UserService){}


    @Post('/users')
    // @UsePipes(new BackendValidationPipe())
        async createUser(
            @Body('user') createUserDTO:CreateUserDTO,
            @Res({ passthrough: true }) response: Response
        ):Promise<userResponseInterface>{
            const newUser = await this.userService.createUser(createUserDTO)
            await response.cookie('jwt', newUser.user.token, {
                httpOnly: true, // Только для сервера
                secure: false, // Отключите для локальной разработки
                sameSite: 'lax', // Обеспечьте доступность для запросов с вашего фронтенда
                maxAge: 24 * 60 * 60 * 1000, // 1 день
                path: '/', // Доступно для всех путей
              });
            console.log(response);
            

            return newUser
        }

    // @UsePipes(new BackendValidationPipe())
    @Post('/users/login')
    async loginUser(
        @Body('users',)loginUserDTO:loginUserDTO,
        @Res({ passthrough: true }) response: Response
    ): Promise<userResponseInterface>{
        const user =  this.userService.login(loginUserDTO)
        await response.cookie('jwt',(await user).user.token, {
            httpOnly: true, // Только для сервера
            secure: false, // Отключите для локальной разработки
            sameSite: 'lax', // Обеспечьте доступность для запросов с вашего фронтенда
            maxAge: 24 * 60 * 60 * 1000, // 1 день
            path: '/', // Доступно для всех путей
          });
          
        return user
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async getUser(@User() user:UserEntity):Promise<userResponseInterface>{      
        return this.userService.sendUserClient(user)
    }

    @Put('user')
    @UseGuards(AuthGuard)
    async updateUser(
        @Body('user')updateUserDTO:UpdateUserDTO,
        @User('id')userId:number
    ):Promise<updateUserInterface>{
        return await this.userService.updateUser(updateUserDTO,userId)
    }
}
 