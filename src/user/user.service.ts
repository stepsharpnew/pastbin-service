import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/createUserDTO';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken'
import { JWT_SECRET } from '@app/config';
import { userResponseInterface } from './types/userResponseInterface';
import { loginUserDTO } from './dto/loginUserDTO';
import { UserLoginType } from './types/user.login.type';
import { compare } from 'bcrypt'
import { UpdateUserDTO } from './dto/updateUserDTO';
import { response } from 'express';
import { updateUserInterface } from './types/updateUser.interface';
import { UpdateUserType } from './types/updateUserType';
import { UpdateUserResponse } from './types/updateUserResponse';


@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity)
    private readonly userRepository:Repository<UserEntity> ){}

    async createUser(createUserDTO:CreateUserDTO){
        const errorResponse = {
            errors : {

            }
        }
        const userByEmail = await this.userRepository.findOne({where : {
                email : createUserDTO.email
            },

        })
        const userByUsername = await this.userRepository.findOne({where : {
            username : createUserDTO.username
        }})

        if (userByEmail) {
            errorResponse.errors['email'] = "already used"
        }
        
        if (userByUsername) {
            errorResponse.errors['username'] = "already used"
        }
        if (userByEmail || userByUsername){
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
        }


        let Newuser = new UserEntity()
        Object.assign(Newuser,createUserDTO)
        Newuser = await this.userRepository.save(Newuser)
        
        return {
            user : {
                ...Newuser,
                token : this.generateJWT(Newuser)
            }
        }

    }
    generateJWT(user:UserEntity):string{
        return sign({
            id : user.id,
            email : user.email,
            username: user.username
        }, JWT_SECRET)
    }

    async sendUserClient(user:UserEntity):Promise<userResponseInterface>{
        const token = this.generateJWT(user)
        return {
            user : {
                ...user,
                token : await this.generateJWT(user)
            }
        }
    }
    async updateUser(updateUserDTO:UpdateUserDTO,userId:number):Promise<updateUserInterface>{
        let user = await this.userRepository.findOne({

            where : {
                id:userId
            }
        })
        
        await this.userRepository.save(user)
        return {
            user : {
                ...user
            }
        }
        
    }

    async login(user:loginUserDTO):Promise<userResponseInterface>{
        const response = await this.userRepository.findOne({
            where : { email : user.email },
            select : ['bio','email', 'password', 'id', 'image','username']
        })
        const errorResponse = {
            errors : {

            }
        }
        if (!response) {
            errorResponse.errors['user'] = "didnt exist"
        }
        if (!response) {
            throw new HttpException(errorResponse,HttpStatus.UNPROCESSABLE_ENTITY)
        }
        
        const validPass = await compare(user.password,response.password)
        if (!validPass) {
            errorResponse.errors['password'] = "Incorrect"
        }
        if (!validPass) {
            throw new HttpException(errorResponse,HttpStatus.UNPROCESSABLE_ENTITY)
        }
        delete response.password
        return {
            user : {
                ...response,
                token : this.generateJWT(response)
            }
        }
    }
     findById(id:number):Promise<UserEntity>{
        return  this.userRepository.findOne({where : {
            id
        }})
    }
}
