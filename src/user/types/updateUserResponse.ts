import { UserEntity } from "../user.entity";

    
export type UpdateUserResponse = Omit<UserEntity,'hashPassword'>