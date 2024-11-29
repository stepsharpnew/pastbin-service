import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileType } from './types/ProfileType';
import { ProfileResponseInterface } from './types/ProfileResponse.interface';
import { FollowEntity } from './folow.entity';

@Injectable()
export class ProfileService {
    constructor(@InjectRepository(UserEntity)
        private readonly userRepository : Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository : Repository <FollowEntity>
    ){}

    async getProfiles(id: number, username:string):Promise<ProfileType>{
        const user = await this.userRepository.findOne({
            where : {
                username : username
            }
        })
        if (!user) {
            throw new HttpException('Нет такого пользователя',HttpStatus.NOT_FOUND)
        }
        const profile = await this.followRepository.findOne({
            where : {
                folowedId : id,
                folowingId : user.id
            }
            
        })

        let folowing : boolean = false
        if (profile) {
            folowing = true
        }
        return {...user, folowing}
    }


    async addFollow(id:number, username : string):Promise<ProfileType>{
        const user = await this.userRepository.findOne({
            where : {
                username
            }
        })
        console.log(user);
        
        if (!user) {
            throw new HttpException('Нет такого пользователя',HttpStatus.NOT_FOUND)
        }
        if (user.id === id) {           
            throw new HttpException('Нельзя фоловить себя',HttpStatus.BAD_REQUEST)
        }
        const follow = await this.followRepository.findOne({
            where : {
                folowedId : id,//Айди пользователя, который подписался
                folowingId : user.id //Айди пользователя, на которого подписались
            }
        })
        if(!follow){
            const followCreate = new FollowEntity()
            followCreate.folowedId = id
            followCreate.folowingId = user.id
            await this.followRepository.save(followCreate)
        }
        return {...user, folowing : true}
    }

    async deleteFollow(
        id: number,
        username: string
    ):Promise<ProfileType>{
        const user = await this.userRepository.findOne({
            where : {
                username
            }
        })
        if (!user) {
            throw new HttpException('Нет такого пользователя',HttpStatus.BAD_REQUEST)
        }
        if (user.id === id) {
            throw new HttpException('Нельзя анфоловить себя',HttpStatus.BAD_REQUEST)
        }
        const profile = await this.followRepository.findOne({
            where : {
                folowedId : id,
                folowingId : user.id
            }
        })
        if (profile) {
            const deletetProf = await this.followRepository.delete(profile)
            console.log(deletetProf);
        }
        return {...user, folowing: false}
        
    }   

    buildResponse(profile : ProfileType):ProfileResponseInterface{
        delete profile.email
        return {
            profile : profile
        }
    }

}
