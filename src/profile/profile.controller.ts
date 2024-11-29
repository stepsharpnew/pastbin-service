import { User } from '@app/user/decorators/user.decorator';
import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { ProfileResponseInterface } from './types/ProfileResponse.interface';


@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService:ProfileService){}

    @Get('/:username')
    async getProfile(
        @User('id')userId :number,
        @Param('username')username : string
    ){
        const profile = await this.profileService.getProfiles(userId,username)
        console.log(profile);
        
        return this.profileService.buildResponse(profile)
    }

    @Post(':username/follow')
    @UseGuards(AuthGuard)
    async addFollow(
        @User('id') userId:number,
        @Param('username') username : string
    ):Promise<ProfileResponseInterface> {
        const profile =  await this.profileService.addFollow(userId, username)
        return this.profileService.buildResponse(profile)
    }

    @Delete(':username/follow')
    @UseGuards(AuthGuard)
    async deleteFollow(
        @User('id') currentUserID : number,
        @Param('username') username : string
    ):Promise<ProfileResponseInterface>{
        const profile = await this.profileService.deleteFollow(currentUserID,username)
        return this.profileService.buildResponse(profile)
    }

}
