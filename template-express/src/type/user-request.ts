import { Request } from 'express'
import {UserRow} from "../model/user-model";

export interface UserRequest extends Request{
    user?: UserRow
}