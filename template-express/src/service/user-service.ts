import {CreateUserRequest, IUser, LoginUserRequest, toUserResponse, User, UserResponse} from "../model/user-model";
import {Validation} from "../validation/validation";
import {UserValidation} from "../validation/user-validation";
import {ResponseError} from "../error/response-error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (user: IUser) => {
    return jwt.sign({ email: user.email, role: user.role, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
};

export class UserService {


    static async registerUser(request:CreateUserRequest): Promise<UserResponse> {
        const registerRequest = Validation.validate(UserValidation.REGISTER,request);

        const findEmail = await User.findOne({where: {email: registerRequest.email}});
        if(findEmail) throw new ResponseError(400,"Email already exists");

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const user = await User.create(registerRequest);

        return toUserResponse(user);
    }

    static async login(request:LoginUserRequest): Promise<UserResponse> {
        const loginRequest = Validation.validate(UserValidation.LOGIN,request);

        const findEmail = await User.findOne({where: {email: loginRequest.email}});
        if(!findEmail) throw new ResponseError(401,"Email or password is incorrect");

        const isPasswordValid = await bcrypt.compare(loginRequest.password, findEmail.password);
        if(!isPasswordValid) throw new ResponseError(401,"Email or password is incorrect");

        const token = generateToken(findEmail);
        const response = toUserResponse(findEmail);
        response.token = token;
        return response;
    }
}