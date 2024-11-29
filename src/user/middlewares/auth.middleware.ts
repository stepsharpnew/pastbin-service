import { JWT_SECRET } from "@app/config";
import { expressRequestInterface } from "@app/types/expressRequest.interface";
import { Injectable,NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserService } from "../user.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService:UserService){}

    async use(req: expressRequestInterface, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            req.user = null
            next()
            return
        }
        const token = authHeader.split(' ')[1]
        try {
            const decode = verify(token,JWT_SECRET)
            const user = await this.userService.findById(decode.id)
            req.user = user
            console.log(user);
            next()
        } catch (error) {
            req.user = null 
            next()
        }
    }
}