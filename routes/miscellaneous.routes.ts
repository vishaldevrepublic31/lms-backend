import { Router } from 'express';
import {
    contactUs,
    userStats,
} from '../controllers/miscellaneous.controller';
import { authorizeRoles, isLoggedIn } from '../middlewares/auth.middleware';

const router = Router();


router.route('/contact').post(contactUs);
router
    .route('/admin/stats/users')
    .get(isLoggedIn, authorizeRoles('ADMIN'), userStats);

export default router;
