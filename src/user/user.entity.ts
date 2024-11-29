import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { hash } from 'bcrypt'
import { ArticleEntity } from "@app/articles/articles.entity";
@Entity({name:'users'})
export class UserEntity{
    @PrimaryGeneratedColumn()
    id:number

    @Column({select : false})
    password : string

    @Column({default :''})
    image : string

    @Column()
    email : string

    @Column({default:''})
    bio: string

    @Column({default:''})
    username: string

    @BeforeUpdate()
    @BeforeInsert()
    async hashPassword(){
        this.password = await hash(this.password,3)
    }

    @OneToMany(()=>ArticleEntity, (articles)=>articles.author)
    articles: ArticleEntity

    @ManyToMany(()=>ArticleEntity)
    @JoinTable()
    favorites: ArticleEntity[]

}
