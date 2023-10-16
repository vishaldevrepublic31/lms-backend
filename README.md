# lms-backend

A Learning Management System (LMS) is  web-based platform designed to facilitate and manage the delivery of educational content  to learners

### Setup instruction

1. Clone the project

```
    git clone https://github.com/vishaldevrepublic31/lms-backend.git
```

2. Move into the directory

```
    cd lms-backend
```

3. install dependencies

```
    npm i
```

4. run the server

```
    npm start
```

### dependencies

```
    "@types/node": "^20.8.2",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.3",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.5",
    "razorpay": "^2.9.2"
```

### .env
```
PORT = 5000
MONGO_URL = mongodb+srv://vishaldevrepublic:vishaldevrepublic@lms.crhi8yr.mongodb.net/lms
NODE_ENV = production
JWT_SECRET = vishalparmar
JWT_EXPIRY = 7day   

CLOUDINARY_CLOUD_NAME = dzvhvdwbp
CLOUDINARY_API_KEY = 116234577541158
CLOUDINARY_API_SECRET = rg3ylBOGr7DVqNzc6cJBHG7Zuz4

SMTP_HOST = sandbox.smtp.mailtrap.io
SMTP_PORT = 587
SMTP_USERNAME = d321a8483977ee
SMTP_PASSWORD = dhewkbeohofsgiub
SMTP_FROM_EMAIL = vishaldevrepublic@gmail.com


USER_EMAIL = vishaldevrepublic@gmail.com
USER_PASS = ufamkytbcgjivmnm

FRONTEND_URL = http://127.0.0.1:5173/
RAZORPAY_KEY_ID = rzp_test_cJzrtQrhxRO8SX
RAZORPAY_SECRET = DhbYtFybsvrbitEodS8xVEyF
RAZORPAY_PLAN_ID = plan_MkV824UfVKzNFu

CONTACT_US_EMAIL = vishaldevrepublic@gmail.com
```
