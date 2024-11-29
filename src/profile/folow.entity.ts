import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name : 'folows'})
export class FollowEntity{

    @PrimaryGeneratedColumn()
    id : number

    @Column()
    folowingId : number
    
    @Column()
    folowedId : number
}