import { Injectable } from '@nestjs/common';
import { TagEntity } from '@app/tag/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class TagService {
    constructor(@InjectRepository(TagEntity)
    private readonly tagReposytory: Repository<TagEntity>){}

    async getTags():Promise<TagEntity[]> {
        const tags =  await this.tagReposytory.find()
        return tags
    }
}
