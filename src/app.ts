import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db/db';
import { errorMiddleware } from './middlewares/error.Middleware';
import { ApiError } from './utils/ApiError';

// Import Routes
import authRoutes from './routes/auth.Routes';
import movieRoutes from './routes/movie.Routes';
import genreRoutes from './routes/genre.Routes';
import keywordRoutes from './routes/keyword.Routes';
import castRoutes from './routes/cast.Routes';
import commentRoutes from './routes/comment.Routes';
import favoriteRoutes from './routes/favorite.Routes';
import ratingRoutes from './routes/rating.Routes';
import subtitleRoutes from './routes/subtitle.Routes';
import historyRoutes from './routes/history.Routes';
import trailerRoutes from './routes/trailer.Routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check Routes
app.get('/', (req, res) => {
  res.status(200).send('Server is alive!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Routes
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/genres', genreRoutes);
app.use('/keywords', keywordRoutes);
app.use('/casts', castRoutes);
app.use('/comments', commentRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/ratings', ratingRoutes);
app.use('/subtitles', subtitleRoutes);
app.use('/histories', historyRoutes);
app.use('/trailers', trailerRoutes);

// Handle 404 Not Found
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Error Handler
app.use(errorMiddleware);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối Database:", error);
  }
};

startServer();