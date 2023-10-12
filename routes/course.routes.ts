import { Router } from 'express'
import { getAllCourses, getLecturesByCourseId, createCourse, updateCourseById, deleteCourseById, addLectureToCourseById, removeLectureFromCourse } from '../controllers/course.controller'
import { authorizeRoles, authorizeSubscribers, isLoggedIn } from '../middlewares/auth.middleware'
import upload from '../middlewares/multer.middleware'

const router = Router()

router.get('/', getAllCourses)
router.post('/', isLoggedIn, authorizeRoles('ADMIN'), upload.single('thumbnail'), createCourse)
router.delete('/', isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourse)

router.get('/:id', isLoggedIn, authorizeSubscribers, getLecturesByCourseId)
router.post('/:id', isLoggedIn, authorizeRoles('ADMIN'), upload.single('lecture'), addLectureToCourseById)
router.put('/:id', isLoggedIn, authorizeRoles('ADMIN'), upload.single('thumbnail'), updateCourseById)
router.delete('/:id', isLoggedIn, authorizeRoles('ADMIN'), deleteCourseById)

export default router