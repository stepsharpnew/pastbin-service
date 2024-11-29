import { ArticleEntity } from "../articles.entity";
import { ArticleType } from "./typeArticle";

export interface ArticlesResponseInterface {
    articles : ArticleType[],
    articlesCount : number
}