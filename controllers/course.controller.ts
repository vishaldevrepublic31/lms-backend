import fs from 'fs/promises';
import cloudinary from 'cloudinary';
import { Request, Response, NextFunction } from "express"
import AppError from "../utils/appError"
import Course from "../models/course.model"

const getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const courses = await Course.find({}).select('-lectures')
        if (courses.length === 0) return next(new AppError("No Any courses available", 400))
        res.status(200).json({
            success: true,
            courses
        })
    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const getLecturesByCourseId = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    try {
        if (!id) return next(new AppError("Bad request", 400))
        const course = await Course.findById(id)
        if (!course) return next(new AppError("Invalid course id or course not found.", 404))
        res.status(200).json({
            success: true,
            lectures: course.lectures
        })
    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const createCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { title, description, category, createdBy } = req.body
    try {
        if (!title || !description || !category || !createdBy) return next(new AppError('All fields are required', 400))
        const course: any = await Course.create({
            title,
            description,
            category,
            createdBy
        })
        if (!course) return next(new AppError('Course could not be created, please try again', 400))

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,
                    {
                        folder: "lms",
                    })
                if (result) {
                    course.thumbnail.public_id = result.public_id
                    course.thumbnail.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error: any) {
                return next(
                    new AppError(error || "File not uploaded, please try again", 400)
                );
            }
        }

        await course.save()
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        })
    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const updateCourseById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    try {
        const course: any = await Course.findById(id)
        if (!course) return next(new AppError('Invalid course id or course not found.', 400))

        course.title = req.body.title || course.title
        course.description = req.body.description || course.description
        course.category = req.body.category || course.category
        course.createdBy = req.body.createdBy || course.createdBy

        if (req.file) {
            await cloudinary.v2.uploader.destroy(course.thumbnail.public_id)
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,
                    {
                        folder: "lms",

                    })
                if (result) {
                    course.thumbnail.public_id = result.public_id
                    course.thumbnail.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error: any) {
                return next(new AppError(error.message || "Something went Wrong", 500))
            }
        }
        await course.save()
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        })
    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const deleteCourseById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    try {
        const course: any = await Course.findById(id)

        if (!course) return next(new AppError('Course not found', 404))


        if (course) {
            await cloudinary.v2.uploader.destroy(course.thumbnail.public_id)
            await Course.findByIdAndDelete(id)
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
        })


    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

const addLectureToCourseById = async (req: any, res: Response, next: NextFunction) => {
    const { title, description } = req.body
    const { id } = req.params

    let lectureData: any = {};
    try {
        if (!title || !description) return next(new AppError('All fields are required', 400))
        const course = await Course.findById(id)
        if (!course) return next(new AppError('Invalid course id or course not found.', 400))
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,
                    {
                        folder: "lms",
                        hunk_size: 50000000, // 50 mb size
                        resource_type: 'video',
                    })
                if (result) {

                    lectureData.public_id = result.public_id
                    lectureData.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error: any) {
                return next(
                    new AppError(error || "File not uploaded, please try again", 400)
                );
            }
        }

        course.lectures.push({
            title,
            description,
            lecture: lectureData,
        });
        course.numberOfLectures = course.lectures.length;
        await course.save();
        res.status(200).json({
            success: true,
            message: 'Lecture added successfully',
            course
        })
    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }

}

const removeLectureFromCourse = async (req: any, res: Response, next: NextFunction) => {
    const { courseId, lectureId } = req.query
    try {
        if (!courseId || !lectureId) return next(new AppError('courseId or lectureId is required', 400))
        const course = await Course.findById(courseId)
        if (!course) return next(new AppError('Invalid course id or course not found.', 400))

        const lectureIndex = course.lectures.findIndex((lecture: any) => lecture._id.toString() === lectureId)

        if (lectureIndex === -1) return next(new AppError('Lecture not found', 400))

        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
                resource_type: 'video',
            }
        );

        course.lectures.splice(lectureIndex, 1)

        course.numberOfLectures = course.lectures.length;

        await course.save()
        res.status(200).json({
            success: true,
            message: 'Lecture removed successfully',
            course
        })


    } catch (error: any) {
        return next(new AppError(error.message || "Something went Wrong", 500))
    }
}

export { getAllCourses, getLecturesByCourseId, createCourse, updateCourseById, deleteCourseById, addLectureToCourseById, removeLectureFromCourse }