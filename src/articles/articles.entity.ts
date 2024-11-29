import { UserEntity } from "@app/user/user.entity";
import slugify from "slugify";
import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "articles"})
export class ArticleEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    slug: string

    @Column()
    title: string

    @Column({default : ''})
    description: string

    @Column({default : ''})
    body: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column('simple-array')
    tagList : string[]

    @Column({default : 0})
    favoritesCount:number

    @BeforeUpdate()
    async updateTime(){
        this.updatedAt = new Date
    }

    @ManyToOne(()=>UserEntity, (author)=> author.articles,{eager : true})
    author:UserEntity
    
}