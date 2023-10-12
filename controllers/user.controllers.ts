import { NextFunction, Request, Response } from "express"
import AppError from "../utils/appError"
import User from "../models/user.model"
import bcrypt from 'bcryptjs'
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail";
import crypto from 'crypto'

const cookieOptions = {
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
};

const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const { fullName, email, password } = req.body

    try {
        if (!fullName || !email || !password) { return next(new AppError("All fields are required", 400)) }

        const userExist = await User.findOne({ email })

        if (userExist) return next(new AppError("Email already exists", 409))

        const user: any = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url:
                    "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
            },
        })


        if (!user) return next(new AppError("User registration failed, please try again later", 400))

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,
                    {
                        folder: "lms",
                        width: 250,
                        height: 250,
                        gravity: "faces",
                        crop: "fill",
                    })
                if (result) {
                    user.avatar.public_id = result.public_id
                    user.avatar.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error: any) {
                return next(
                    new AppError(error.message || "File not uploaded, please try again", 400)
                );
            }
        }


        await user.save()
        user.password = undefined
        const token = await user.generateJWTToken()
        res.cookie('token', token, cookieOptions)
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        })
    } catch (error: any) {
        return next(
            new AppError(error.message || "Somthin went wrong!", 500)
        );
    }

}

const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body
    try {
        if (!email || !password) return next(new AppError("Email and Password are required", 400))

        const user: any = await User.findOne({ email }).select('+password')
        if (!user) return next(new AppError("User not found", 400))
        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) return next(new AppError("Email or password wrong", 400))
        const token = await user.generateJWTToken()
        res.cookie("token", token, cookieOptions);
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user
        });
        res.status(200).json({
            success: true,
            user,
            res
        })
    } catch (error: any) {
        return next(
            new AppError(error.message || "Somthin went wrong!", 500)
        );
    }
}

const logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        })

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error: any) {
        return next(
            new AppError(error.message || "Somthin went wrong!", 500)
        );
    }
}

const profile = async (req: any, res: Response, next: NextFunction): Promise<any> => {

    try {
        const userId = req.user.id
        const user: any = await User.findById(userId)

        if (user) {
            return res.status(200).json({
                success: true,
                message: "User profile fetched successfully",
                user
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "User profile not found"
            })
        }

    } catch (error: any) {
        return next(
            new AppError(error.message || "Somthin went wrong!", 500)
        );
    }
}

const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email } = req.body
    try {
        if (!email) return next(new AppError("email is required", 400))
        const user: any = await User.findOne({ email })

        if (!user) return next(new AppError("email not register", 400))

        const resetToken: any = await user.generatePasswordResetToken()
        const resetPasswordUrl = `/reset-password/${resetToken}`;


        // We here need to send an email to the user with the token

        const message = resetPasswordUrl;

        try {
            await sendEmail(email, message)
            res.status(200).json({
                success: true,
                message: `Password reset link sent to your email ${email}`
            })

        } catch (error: any) {
            user.forgotPasswordExpiry = undefined;
            user.forgotPasswordToken = undefined;
            user.save();
            return next(
                new AppError(error.message || "Somthin went wrong!", 500)
            );
        }

    } catch (error: any) {
        return next(
            new AppError(error.message || "Somthin went wrong!", 500)
        );
    }
}
const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { resetToken } = req.params
    const { password } = req.body
    try {
        const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        if (!password) return next(new AppError("Password is required", 400))
        console.log(forgotPasswordToken);
        const user: any = await User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry: { $gt: Date.now() },
        })
        if (!user) return next(new AppError("Token is invalid or expired, please try again", 400))
        // Update the password if token is valid and not expired
        user.password = password;

        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();


        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error: any) {
        return next(
            new AppError(error.message || "Somthin went wrong!", 500)
        );
    }
}
const changePassword = async (req: any, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;
    try {
        if (!oldPassword || !newPassword) return next(new AppError("all fields must be required!", 400))
        const user: any = await User.findById(id).select('+password')

        if (!user) return next(new AppError("User not found", 400))
        console.log(user)
        const comparePassword = await bcrypt.compare(oldPassword, user.password);

        if (!comparePassword) return next(new AppError("Old password is wrong", 400))

        user.password = newPassword;
        await user.save();
        user.password = undefined;
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            user
        })
    } catch (error) {
        return next(new AppError("something went wrong", 500))
    }
}

const updateProfile = async (req: any, res: Response, next: NextFunction): Promise<any> => {
    const { fullName } = req.body
    const { id } = req.user
    try {
        const user = await User.findById(id)

        if (!user) return next(new AppError("user dose not exist", 400))

        if (fullName) {
            user.fullName = fullName
        }

        if (req.file) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id)
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,
                    {
                        folder: "lms",
                        width: 250,
                        height: 250,
                        gravity: "faces",
                        crop: "fill",
                    })
                if (result) {
                    user.avatar.public_id = result.public_id
                    user.avatar.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error: any) {
                return next(
                    new AppError(error || "File not uploaded, please try again", 400)
                );
            }


            await user.save()

            res.status(200).json({
                success: true,
                message: "Profile Updated",
                user
            })

        }

    } catch (error) {
        return next(new AppError("something went wrong", 500))
    }
}

export { register, login, logout, profile, resetPassword, forgotPassword, changePassword, updateProfile }