import { Schema, model } from 'mongoose'
interface ICourse extends Document {
    title: string
    description: string
    category: string
    lectures: any
    thumbnail: string
    numberOfLectures: number
    createdBy: string

}
const courseSchema: Schema<ICourse> = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [8, 'Title must be atleast 8 characters'],
        maxlength: [50, 'Title cannot be more than 50 characters'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [20, 'Description must be atleast 20 characters long'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true,
                },
                secure_url: {
                    type: String,
                    required: true,
                },
            },
        },
    ],
    thumbnail: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
    numberOfLectures: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: [true, 'Course instructor name is required'],
    },
}, {
    timestamps: true
})

const Course = model('course', courseSchema)
export default Course