import { Request, Response, NextFunction } from "express-serve-static-core";
import AppError from "../utils/appError";
import User from "../models/user.model";
import { razorpay } from '../index'
import crypto from 'crypto';
import Payment from "../models/payment.model";

const getRazorpayApiKey = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const key = process.env.RAZORPAY_KEY_ID
        if (!key) return next(new AppError('key not found', 404))
        res.status(200).json({
            success: true,
            key
        })


    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const buySubscription = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user
        const user: any = await User.findById(id)
        if (!user) return next(new AppError('user not found', 404))
        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase a subscription', 400))
        }

        const subscription: any = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12
        })
        user.subscription.id = subscription.id
        user.subscription.status = subscription.status

        await user.save()
        res.status(200).json({
            success: true,
            message: 'subscribed successfully',
            subscription_id: subscription.id,
        })

    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}
const verifySubscription = async (req: any, res: Response, next: NextFunction) => {
    const { id } = req.user
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
        req.body;
    try {
        const user: any = await User.findById(id)
        if (!user) return next(new AppError('user not found', 404))
        const subscriptionId: any = user.subscription.id

        const generatedSignature: any = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET || '')
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');



        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment not verified, please try again.', 400));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        });

        user.subscription.status = 'active';

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
        });

    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const cancelSubscription = async (req: any, res: Response, next: NextFunction) => {

    const { id } = req.user;

    const user: any = await User.findById(id);
    if (user.role === 'ADMIN') {
        return next(
            new AppError('Admin does not need to cannot cancel subscription', 400)
        );
    }
    const subscriptionId = user.subscription.id;

    try {
        const subscription = await razorpay.subscriptions.cancel(
            subscriptionId
        )
        user.subscription.status = subscription.status;

        await user.save();
    } catch (error: any) {
        return next(new AppError("somthing went wrong", 500));
    }


    const payment: any = await Payment.findOne({
        razorpay_subscription_id: subscriptionId,
    });
    console.log(payment)

    const timeSinceSubscribed = Date.now() - payment
    const refundPeriod = 14 * 24 * 60 * 60 * 1000;


    if (refundPeriod <= timeSinceSubscribed) {
        return next(
            new AppError(
                'Refund period is over, so there will not be any refunds provided.',
                400
            )
        );
    }


    await razorpay.payments.refund(payment.razorpay_payment_id, {
        speed: 'optimum',
    });

    user.subscription.id = undefined;
    user.subscription.status = undefined;

    await user.save();
    await Payment.findByIdAndDelete(payment._id)
    // await payment.remove();


    res.status(200).json({
        success: true,
        message: 'Subscription canceled successfully',
    });
}

const allPayments = async (req: any, res: Response, next: NextFunction) => {

    try {
        const { count, skip } = req.query;


        const allPayments = await razorpay.subscriptions.all({
            count: count ? count : 10,
            skip: skip ? skip : 0,
        });

        const monthNames: any = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const finalMonths: any = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        const monthlyWisePayments = allPayments.items.map((payment: any) => {

            const monthsInNumbers = new Date(payment.start_at * 1000);

            return monthNames[monthsInNumbers.getMonth()];
        });

        monthlyWisePayments.map((month: any) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if (month === objMonth) {
                    finalMonths[month] += 1;
                }
            });
        });

        const monthlySalesRecord: any = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
        });

        res.status(200).json({
            success: true,
            message: 'All payments',
            allPayments,
            finalMonths,
            monthlySalesRecord,
        });
    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

export {
    getRazorpayApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    allPayments
}