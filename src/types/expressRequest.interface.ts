import { UserEntity } from "@app/user/user.entity";
import { Request } from "express";

export interface expressRequestInterface extends Request{
    user ?: UserEntity
}