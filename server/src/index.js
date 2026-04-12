import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runMigrations } from './db/migrate.js';
import { errorHandler } from './middleware/errorHandler.js';
import studentsRouter    from './routes/students.js';
import classesRouter     from './routes/classes.js';
import assignmentsRouter from './routes/assignments.js';
import attendanceRouter  from './routes/attendance.js';
import feesRouter        from './routes/fees.js';
import dashboardRouter   from './routes/dashboard.js';
import settingsRouter    from './routes/settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  await runMigrations();
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const BASE = '/api/v1';
app.use(`${BASE}/students`,    studentsRouter);
app.use(`${BASE}/classes`,     classesRouter);
app.use(`${BASE}/assignments`, assignmentsRouter);
app.use(`${BASE}/attendance`,  attendanceRouter);
app.use(`${BASE}/fees`,        feesRouter);
app.use(`${BASE}/dashboard`,   dashboardRouter);
app.use(`${BASE}/settings`,    settingsRouter);

// Serve client in production
const clientDist = join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(clientDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});
 
 
