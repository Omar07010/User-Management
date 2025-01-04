import express from 'express'
import session from 'express-session';
import passport from './passport-config.js';
import userRouter from './routes/user.js';
import roleRouter from './routes/role.js';
import connectDB from './config/db.js'; 
import dotenv from 'dotenv';
import helmet from 'helmet';


// using swagger
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';


const swaggerDocument = YAML.load('swagger.yaml');




const app = express();
dotenv.config();


const port = process.env.PORT || 3000;
const api = process.env.API;
const sess_secret = process.env.SESS_SECRET; 




// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // For parsing application/json
app.use(session({ secret: sess_secret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//  Using Routers
app.use(`${api}users`, userRouter);
app.use(`${api}roles`, roleRouter);



// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

 
connectDB()

app.listen(port, () => {
  console.log(`Example app listening on: http://localhost:${port}`)
})

// Using error handler after all routes so the code work
app.use(errorHandler);