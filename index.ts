import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v2 } from 'cloudinary';
import Razorpay from 'razorpay';

// file import 
import connectDb from './db/db'
import userRoute from './routes/user.routes'
import courseRoute from './routes/course.routes'
import miscRoutes from './routes/miscellaneous.routes'
import paymentRoute from './routes/payment.routes'
import errorMiddleware from './middlewares/error.middleware'



// ENV
dotenv.config()

// PORT
const PORT = process.env.PORT || 5000

const app = express()
// Database
connectDb()

// cloud
v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Razorpay configuration
const keyId: string = process.env.RAZORPAY_KEY_ID || '';
const keySecret: string = process.env.RAZORPAY_SECRET || '';

export const razorpay: any = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});


// middlewares
app.use(express.json())
app.use(cors(
    {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
))
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// routes
app.get('/pig',(res,res)=>{
    res.send('pong');
})

app.use('/api/v1/user', userRoute)
app.use('/api/v1/course', courseRoute)
app.use('/api/v1/payments', paymentRoute)
app.use('/api/v1', miscRoutes);
app.all('*', (req: Request, res: Response) => {
    res.status(404).send("OOPS!! 404 Not Found")
})
app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`server on in ${PORT}`)
})


