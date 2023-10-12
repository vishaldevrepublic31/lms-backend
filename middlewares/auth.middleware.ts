import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/user.model';

const isLoggedIn = async (req: any, res: Response, next: NextFunction): Promise<any> => {
    const { token } = req.cookies;
    if (!token) return next(new AppError('Unauthenticated, please login again', 401));
    const userDetails: any = await jwt.verify(token, process.env.JWT_SECRET as Secret);
    req.user = userDetails;
    next();
};


const authorizeRoles = (...roles: any) => async (req: any, res: Response, next: NextFunction): Promise<any> => {
    console.log(req.user.role)
    const currentUserRole = req.user.role
    if (!roles.includes(currentUserRole)) {
        return next(new AppError("You do not have permission to view this route", 403))
    }
    next()
}


const authorizeSubscribers = async (req: any, _res: Response, next: NextFunction) => {
    const user: any = await User.findById(req.user.id)
    if (!user) {
        return next(new AppError("Please try again", 404))
    }

    if (user.role !== "ADMIN" && user.subscription.status !== "active") {
        return next(new AppError("Please subscribe to access this route.", 403));
    }

    next();
};
export { isLoggedIn, authorizeRoles, authorizeSubscribers };
