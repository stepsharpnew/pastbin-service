import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { UserEntity } from "@app/user/user.entity";
import { CreateArticleDTO } from "./dto/createArticleDto";
import { User } from "@app/user/decorators/user.decorator";
import { ArticleResponseInterface } from "./types/articleResponseInterface";
import { UpdateArticleDTO } from "./dto/updateArticleDTO";
import { ArticlesResponseInterface } from "./types/ArticlesResponse.interface";
import { BackendValidationPipe } from "@app/shared/BackendValidation.pipe";

@Controller('/articles') 
export class ArticleController {
    constructor (private readonly articleService:ArticleService){}

    @Get()
    async getAll(@Query()query:any, @User('id')user:number):Promise<ArticlesResponseInterface>{
        console.log(query);
        return this.articleService.findAll(query,user)
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async getFeed(
        @User('id') userId:number,
        @Query() query : any
    ):Promise<ArticlesResponseInterface>{
        const feed = await this.articleService.getFeed(userId,query)
        return feed
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async likeArticle(
        @User('id') userId:number,
        @Param('slug') slug:string
    ):Promise<ArticleResponseInterface> {
        const article = await this.articleService.likeArticle(slug,userId)
        return this.articleService.buildResponse(article)
    }
    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async dislikeArticle(
        @User('id') userId:number,
        @Param('slug') slug:string
    ):Promise<ArticleResponseInterface> {
        const article = await this.articleService.dislikeArticle(slug,userId)
        return this.articleService.buildResponse(article)
    }


    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async create(
        @User()currentUser:UserEntity, 
        @Body('article') createArticleDTO:CreateArticleDTO
    ):Promise<ArticleResponseInterface> {
        const article = await this.articleService.create(currentUser,createArticleDTO)
        return this.articleService.buildResponse(article)
    }


    @Get(':slug')
    async getArticleBySlug(
        @Param('slug')slug:string
    ):Promise<ArticleResponseInterface>{
        const article = await this.articleService.getArticleBySlug(slug)
        return this.articleService.buildResponse(article)
    }


    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticleBySlug(
        @User()currentUser:UserEntity,
        @Param('slug') slug:string
    ):Promise<any>{
        return {
            deletde: this.articleService.deleteArticleBySlug(slug,currentUser)
        }
    }

    @Put(':slug')
    @UsePipes(new BackendValidationPipe())
    @UseGuards(AuthGuard)
    async updateArticleBySlug(
        @User('id')currentUserId : number,
        @Body('article') updateArticleDTO:UpdateArticleDTO,
        @Param('slug') slug:string
    ):Promise<ArticleResponseInterface> {
        const article = await this.articleService.updateArticleBySlug(currentUserId,updateArticleDTO,slug)
        return this.articleService.buildResponse(article)
    }
}