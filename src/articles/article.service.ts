import { UserEntity } from "@app/user/user.entity";
import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { CreateArticleDTO } from "./dto/createArticleDto";
import { getRepositoryToken, InjectRepository } from "@nestjs/typeorm";
import { ArticleEntity } from "./articles.entity";
import { DataSource, Repository } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponseInterface";
import slugify from "slugify";
import { UpdateArticleDTO } from "./dto/updateArticleDTO";
import { ArticlesResponseInterface } from "./types/ArticlesResponse.interface";
import { FollowEntity } from "@app/profile/folow.entity";
@Injectable()


export class ArticleService{
    constructor (
    @InjectRepository(ArticleEntity)
    private readonly articleRepositiry:Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository:Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository:Repository<FollowEntity>
    ){}  

    async findAll(query:any,id:number):Promise<ArticlesResponseInterface>{
        const querybuilder = this.articleRepositiry
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.author','author')


        querybuilder.orderBy('articles.createdAt',"DESC")
        console.log(query);
        


        let author
        if (query.author) {
            author = await this.userRepository.findOne({
                where : {
                    username : query.author
                }
            })  
        }
        const articlesCount:number = await querybuilder.getCount()

        if (query.favorited) {
            const author = await this.userRepository.findOne({
                where: { username: query.favorited },
                relations: ['favorites']
            })
            const ids = author.favorites.map((el) => el.id)
        
            if (ids.length > 0) {
                querybuilder.andWhere('articles.authorId IN (:...ids)', { ids })
            } else {
                querybuilder.andWhere('1=0')
            }
        }
    
        if(query.tag){
            querybuilder.andWhere('articles.tagList LIKE :tag',{
                tag : `%${query.tag}%`,

            })
            .orderBy('articles.createdAt',"DESC")
        }
        

        if (query.author) {
            querybuilder.andWhere('articles.author.id = :id',{
                id: author.id
            })
        }

        if (query.limit) {
            querybuilder.limit(query.limit) 
        }
        if (query.offset) {
            querybuilder.offset(query.offset)
        }

        let favoritesIds:number[] = []

        if (id) {
            const user = await this.userRepository.findOne({
                where : {
                    id
                },
                relations : ['favorites']
            })
            favoritesIds = user.favorites.map(favorites => favorites.id)
        }
        const allarticles = await querybuilder.getMany()
        const articleWithFavorites =  allarticles.map(
            (articles) => {
                const favorited = favoritesIds.includes(articles.id)
                return {...articles, favorited}
            })
        // const articles:ArticleEntity[] = await querybuilder.getMany()

        return {
            articles : articleWithFavorites,
            articlesCount
        }
    }


    async getFeed(id:number,query : any): Promise<ArticlesResponseInterface>{
        const follow = await this.followRepository.find({
            where : {
                folowedId : id
            }
        })
        console.log(follow);

        if (follow.length === 0) {
            return {articles : [], articlesCount : 0}
        }
        const followsIds = follow.map((el)=>el.folowingId)

        const querybuilder = this.articleRepositiry
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.author','author')
        .where('articles.author.id IN (:...ids)',{ids : followsIds})

        if (query.limit) {
            querybuilder.limit(query.limit) 
        }
        if (query.offset) {
            querybuilder.offset(query.offset)
        }
  
        const articles = await querybuilder.getMany()
        const articlesCount:number = await querybuilder.getCount()

        return {articles, articlesCount}
    }


    async create(currentUser : UserEntity,createArticleDto:CreateArticleDTO):Promise<ArticleEntity>{
        const article = new ArticleEntity()
        Object.assign(article,createArticleDto)

        if (!article.tagList) {
            article.tagList = []
        }
        article.slug = this.getSlug(createArticleDto.title)
        article.author = currentUser
        return await this.articleRepositiry.save(article)
    }

    buildResponse(article:ArticleEntity):ArticleResponseInterface{
        return {article:article}
    }

    private getSlug(title:string):string{
        return (slugify(title, {
            lower : true
        }) + '-'+
        (Math.random()*Math.pow(36,6)|0).toString(36))
    }

    async getArticleBySlug(slug:string):Promise<ArticleEntity>{
        return await this.articleRepositiry.findOne({
            where : {
                slug
            }
        })
    }
    async likeArticle(slug:string, id : number):Promise<ArticleEntity>{
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne({
            where : {
                id
            },
            relations : ['favorites']
        })

        const isNotFavorited = user.favorites.findIndex((findFavotiteArticle)=>{
            return findFavotiteArticle.id === article.id
        }) === -1

        if (isNotFavorited) {
            user.favorites.push(article)
            article.favoritesCount++
            await this.userRepository.save(user)
            await this.articleRepositiry.save(article)
        }
        return article
    }

    async dislikeArticle (slug:string, id:number):Promise<ArticleEntity>{
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne({
            where : {
                id
            },
            relations : ['favorites']
        })
        const isNotFavorited = user.favorites.findIndex((findFavotiteArticle)=>{
            return findFavotiteArticle.id === article.id
        })

        if (isNotFavorited>=0) {
            user.favorites.splice(isNotFavorited,1)
            article.favoritesCount--
            await this.userRepository.save(user)
            await this.articleRepositiry.save(article)
        }
        return article
    }



    async deleteArticleBySlug(slug:string, user:UserEntity){
        const article = await this.articleRepositiry.findOne({
            where : {
                slug
            }
        })
        if (!article) {
            throw new HttpException('Такой статьи нет',HttpStatus.NOT_FOUND)
        }
        if (article.author.id !== user.id) {
            throw new HttpException('Недостаточно прав',HttpStatus.UNAUTHORIZED)
        }
        return await this.articleRepositiry.delete({slug})
    }

    async updateArticleBySlug(
        id:number,
        updateArticleDTO:UpdateArticleDTO,
        slug:string
    ):Promise<ArticleEntity>{
        let article = await this.articleRepositiry.findOne({
            where : {
                slug
            }
        })
        if (!article) {
            throw new HttpException('Такой статьи нет',HttpStatus.NOT_FOUND)
        }
        if (article.author.id !== id) {
            throw new HttpException('Недостаточно прав',HttpStatus.UNAUTHORIZED)
        }
        Object.assign(article,updateArticleDTO)
        article.slug = this.getSlug(article.title)
        return await this.articleRepositiry.save(article)

    }
}