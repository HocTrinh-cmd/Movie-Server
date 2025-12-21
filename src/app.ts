import express from 'express';
import { Router } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db/db';

const router = Router();

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


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



// ... các đoạn import và middleware giữ nguyên ...

app.get("/", (req, res) => {
  res.json({ message: "✅ API is working!" });
});

// Sửa lại đoạn khởi động server
const startServer = async () => {
  try {
    // Thử kết nối DB trước
    await connectDB();
    console.log("✅ Database connected successfully");

    // Nếu DB ok thì mới bật server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối Database:", error);
    // Quan trọng: Không để process chết để Render còn đọc được log
    // process.exit(1); // Tạm thời comment dòng này nếu có
  }
};

startServer();