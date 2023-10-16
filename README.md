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
MONGO_URL = <Database connection string>
NODE_ENV = production
JWT_SECRET = <Your secret key>
JWT_EXPIRY = <1day,2day etc..>   

CLOUDINARY_CLOUD_NAME = <your cloudinary cloud name>
CLOUDINARY_API_KEY =  <your cloudinary api key>
CLOUDINARY_API_SECRET = <your cloudinary secret key>

SMTP_HOST = <smtp host>
SMTP_PORT = <smtp port>
SMTP_USERNAME = <your smtp username>
SMTP_PASSWORD =<your smtp password>
SMTP_FROM_EMAIL = <your smtp email>


USER_EMAIL = <your email id>
USER_PASS = <your password>

FRONTEND_URL = <frontend url >

RAZORPAY_KEY_ID = <your razorpy key id>
RAZORPAY_SECRET = <your razorpy secret key >
RAZORPAY_PLAN_ID =  <your razorpy plan id>

CONTACT_US_EMAIL =  <your email id>
```
