import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import propertyRoutes from './routes/properties';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toString(),
    })
});

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

