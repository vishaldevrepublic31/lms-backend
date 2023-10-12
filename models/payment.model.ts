import { model, Schema } from 'mongoose';
interface IPayment {
    razorpay_payment_id: string
    razorpay_subscription_id: string
    razorpay_signature: string
}
const paymentSchema: Schema<IPayment> = new Schema(
    {
        razorpay_payment_id: {
            type: String,
            required: true,
        },
        razorpay_subscription_id: {
            type: String,
            required: true,
        },
        razorpay_signature: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Payment = model('Payment', paymentSchema);

export default Payment;
