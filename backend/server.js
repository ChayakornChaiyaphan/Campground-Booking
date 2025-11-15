const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const cors = require('cors');

const mongoSanitize = require('express-mongo-sanitize');

const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');

const rateLimit=require('express-rate-limit');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI =  require('swagger-ui-express');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const campgrounds = require('./routes/campgrounds');
const bookings = require('./routes/bookings');

const app = express();

app.use(cors());

// Body parser
app.use(express.json());

// Sanitize data
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

app.use(helmet());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Libary API',
      version: '1.0.0',
      description: 'A simple libary API'
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/bookings', bookings);

app.set('query parser', 'extended');

const PORT = process.env.PORT || 5000;

const server =  app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});