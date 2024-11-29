import { Module } from "@nestjs/common";
import { ArticleController } from "./articles.controller";
import { ArticleService } from "./article.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "./articles.entity";
import { UserEntity } from "@app/user/user.entity";
import { FollowEntity } from "@app/profile/folow.entity";


@Module({
    imports : [TypeOrmModule.forFeature([ArticleEntity,UserEntity,FollowEntity])],
    controllers : [ArticleController],
    providers : [ArticleService]
})



export class ArticlesModule{
    
}