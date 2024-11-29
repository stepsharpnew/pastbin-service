import { ArticleEntity } from "../articles.entity";


export type ArticleType = Omit<ArticleEntity,'updateTime'>