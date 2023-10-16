import { Response, NextFunction } from "express";
import AppError from "../utils/appError";
import sendEmail from "../utils/sendEmail";
import User from "../models/user.model";

const contactUs = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return next(new AppError('Name, Email, Message are required', 400));
        }

        const subject = 'Contact Us Form';
        const textMessage = `${name} - ${email} <br /> ${message}`;

        await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);

        res.status(200).json({
            success: true,
            message: 'Your request has been submitted successfully',
        });
    } catch (error: any) {
        return next(
            new AppError(error || " please try again", 400)
        );
    }
}

const userStats = async (req: any, res: Response, next: NextFunction) => {
    try {
        const allUsersCount = await User.countDocuments();

        const subscribedUsersCount = await User.countDocuments({
            'subscription.status': 'active',
        });

        res.status(200).json({
            success: true,
            message: 'All registered users count',
            allUsersCount,
            subscribedUsersCount,
        });
    } catch (error: any) {
        return next(
            new AppError(error || "please try again", 400)
        );
    }
}

export { userStats, contactUs }
