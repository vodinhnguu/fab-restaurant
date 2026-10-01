import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';
import routes from './routes.js';

const app = express();

// --- Middleware chung ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // Header bảo mật, cho phép load ảnh từ domain khác
app.use(cors({ origin: env.corsOrigin })); // Cho phép frontend gọi API
app.use(express.json({ limit: '1mb' })); // Đọc body JSON
if (env.nodeEnv !== 'test') app.use(morgan('dev')); // Log request ra console

// --- File tĩnh: ảnh upload ---
app.use('/uploads', express.static('uploads', { maxAge: '7d' }));

// --- API ---
app.get('/', (req, res) => res.json({ name: 'FAB Seafood API', docs: '/api/v1/health' }));
app.use('/api/v1', routes);

// --- Xử lý 404 và lỗi (luôn đặt CUỐI CÙNG) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
