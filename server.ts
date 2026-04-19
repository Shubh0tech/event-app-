import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'eventos-secret-key-123';

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

app.use(cors());
app.use(express.json());

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, interests },
    });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- User Routes ---
app.get('/api/users/me', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        badges: true, 
        registrations: { 
          include: { event: true } 
        },
        organizedEvents: {
          include: {
            registrations: true,
            photos: true
          }
        },
        photos: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, interests, bio, age, avatarUrl } = req.body;
  const userId = (req as any).user.id;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        name, 
        interests: Array.isArray(interests) ? interests.join(',') : interests,
        bio,
        age: age ? parseInt(age.toString()) : null,
        avatarUrl
      },
      include: { 
        badges: true, 
        registrations: true, 
        organizedEvents: {
          include: {
            registrations: true,
            photos: true
          }
        }
      }
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- Comment Routes ---
app.post('/api/events/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const eventId = req.params.id;
  const userId = (req as any).user.id;
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        eventId,
        userId
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// --- Rating Routes ---
app.post('/api/events/:id/ratings', authenticateToken, async (req, res) => {
  const { score, feedback } = req.body;
  const eventId = req.params.id;
  const userId = (req as any).user.id;

  if (score < 1 || score > 5) {
    return res.status(400).json({ error: 'Score must be between 1 and 5' });
  }

  try {
    // Check if user attended the event
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (!registration || registration.status !== 'ACCEPTED') {
      return res.status(403).json({ error: 'Only attendees can rate events' });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_eventId: { userId, eventId }
      },
      update: { score, feedback },
      create: { score, feedback, userId, eventId },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });
    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post rating' });
  }
});

app.post('/api/comments/:id/reply', authenticateToken, async (req, res) => {
  const { reply } = req.body;
  const commentId = req.params.id;
  const userId = (req as any).user.id;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { event: true }
    });

    if (!comment || comment.event.organizerId !== userId) {
      return res.status(403).json({ error: 'Only event organizer can reply' });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { reply },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reply to comment' });
  }
});

// --- Photo Routes ---
app.post('/api/users/photos', authenticateToken, async (req, res) => {
  const { url, caption } = req.body;
  const userId = (req as any).user.id;

  if (!url) {
    return res.status(400).json({ error: 'Photo URL is required' });
  }

  try {
    const photo = await prisma.photo.create({
      data: {
        url,
        caption,
        userId
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

app.post('/api/events/:id/photos', authenticateToken, async (req, res) => {
  const { url, caption } = req.body;
  const eventId = req.params.id;
  const userId = (req as any).user.id;

  if (!url) {
    return res.status(400).json({ error: 'Photo URL is required' });
  }

  try {
    const photo = await prisma.photo.create({
      data: {
        url,
        caption,
        eventId,
        userId
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      }
    });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});
app.get('/api/events', async (req, res) => {
  const events = await prisma.event.findMany({
    include: { 
      activities: true, 
      categories: true,
      registrations: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        }
      },
      comments: {
        include: {
          user: {
            select: { name: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      ratings: {
        include: {
          user: {
            select: { name: true, avatarUrl: true }
          }
        }
      },
      photos: {
        include: {
          user: {
            select: { name: true, avatarUrl: true }
          }
        },
        orderBy: { uploadedAt: 'desc' }
      },
      organizer: {
        select: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true,
          organizedEvents: {
            select: {
              id: true,
              name: true,
              date: true,
              type: true
            },
            take: 3,
            orderBy: { date: 'desc' }
          }
        }
      }
    },
  });
  res.json(events);
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, type, date, swags, location, lat, lng, imageUrl, price, capacity, activities, categories } = req.body;
    const event = await prisma.event.create({
      data: { 
        name, 
        description, 
        type, 
        date: new Date(date),
        swags: Array.isArray(swags) ? swags.join(',') : swags,
        location,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        imageUrl,
        price: price ? parseFloat(price) : 0,
        capacity: capacity ? parseInt(capacity) : 100,
        organizerId: userId,
        activities: activities && Array.isArray(activities) ? {
          create: activities.map((a: any) => ({
            title: a.title,
            time: a.time
          }))
        } : undefined,
        categories: categories && Array.isArray(categories) ? {
          connectOrCreate: categories.map((c: string) => ({
            where: { name: c },
            create: { name: c }
          }))
        } : undefined
      },
      include: { 
        activities: true, 
        categories: true,
        photos: {
          include: {
            user: {
              select: { name: true, avatarUrl: true }
            }
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.post('/api/events/:id/register', async (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;
  try {
    const reg = await prisma.registration.create({
      data: { userId, eventId },
    });

    // Badge logic: Award "First Timer" on first registration
    const regCount = await prisma.registration.count({ where: { userId } });
    if (regCount === 1) {
      await prisma.badge.create({
        data: {
          userId,
          name: 'First Timer',
          description: 'Attended your first event on Event OS!',
          icon: 'Sparkles'
        }
      });
    } else if (regCount === 5) {
      await prisma.badge.create({
        data: {
          userId,
          name: 'Event Veteran',
          description: 'A dedicated member of our community with 5 events attended.',
          icon: 'Award'
        }
      });
    }

    res.json(reg);
  } catch (err) {
    res.status(400).json({ error: 'Already registered or invalid user' });
  }
});

app.put('/api/registrations/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const regId = req.params.id;
  try {
    const reg = await prisma.registration.update({
      where: { id: regId },
      data: { status },
      include: {
        user: true,
        event: true
      }
    });

    if (status === 'ACCEPTED' && reg.user.email) {
      const mailOptions = {
        from: process.env.MAIL_FROM || '"Event OS" <noreply@eventos.com>',
        to: reg.user.email,
        subject: `Registration Confirmed: ${reg.event.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1A1A1A;">You're Going! 🥳</h2>
            <p>Hi <strong>${reg.user.name}</strong>,</p>
            <p>Great news! Your registration for <strong>${reg.event.name}</strong> has been confirmed by the organizer.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Event:</strong> ${reg.event.name}</p>
              <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date(reg.event.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0 0 0;"><strong>Location:</strong> ${reg.event.location || 'See App for Details'}</p>
            </div>
            <p>We can't wait to see you there!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">This is an automated notification from Event OS.</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions).catch(err => {
        console.error('Failed to send confirmation email:', err);
      });
    }

    res.json(reg);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update status' });
  }
});

// --- Group Routes ---
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        owner: { select: { name: true } },
        followers: true
      }
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.post('/api/groups', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  const userId = (req as any).user.id;
  try {
    const group = await prisma.group.create({
      data: { name, description, ownerId: userId }
    });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

app.post('/api/groups/:id/follow', authenticateToken, async (req, res) => {
  const groupId = req.params.id;
  const userId = (req as any).user.id;
  try {
    const follow = await prisma.follower.create({
      data: { userId, groupId }
    });
    res.json(follow);
  } catch (err) {
    res.status(400).json({ error: 'Already following or invalid group' });
  }
});

// --- Activity Routes ---
app.post('/api/activities', async (req, res) => {
  const { title, time, eventId } = req.body;
  const activity = await prisma.activity.create({
    data: { title, time, eventId },
  });
  res.json(activity);
});

// --- Profiles & Settings ---
app.patch('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, bio, avatarUrl, interests } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        avatarUrl,
        interests: Array.isArray(interests) ? interests.join(',') : interests
      }
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.patch('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { imageUrl, name, description, date, type, location, price, capacity, swags } = req.body;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || event.organizerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { 
        imageUrl,
        name,
        description,
        date: date ? new Date(date) : undefined,
        type,
        location,
        price: price ? parseFloat(price) : undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        swags: Array.isArray(swags) ? swags.join(',') : swags
      }
    });
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event image' });
  }
});

// --- Real-time Chat (Socket.IO) ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('message', async (data) => {
    const { userId, sessionId, content } = data;
    try {
      const msg = await prisma.message.create({
        data: { userId, sessionId, content },
        include: { user: { select: { name: true } } },
      });
      io.to(sessionId).emit('message', msg);
    } catch (err) {
      console.error('Socket error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// --- AI Recommendations ---
// We'll handle this in the frontend as per GEMINI_API skill (Always call from frontend)

// --- Vite Middleware & Fallback ---
async function startServer() {
  // Seed initial data if empty
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    console.log('Seeding initial data...');
    // Create a default admin user for seeding
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@eventos.com' },
      update: {},
      create: {
        name: 'Admin Organizer',
        email: 'admin@eventos.com',
        password: hashedPassword,
        interests: 'Tech,Design,Community'
      }
    });

    await prisma.event.create({
      data: {
        name: 'Tech Frontier 2026',
        description: 'The premier conference for AI and Web3 enthusiasts. Join world-class speakers and hackers.',
        type: 'CONFERENCE',
        swags: 'Limited Edition T-Shirt,Tech Stickers,Lanyard',
        location: 'Moscone Center, San Francisco',
        lat: 37.7842,
        lng: -122.4015,
        date: new Date('2026-06-15'),
        organizerId: admin.id,
        activities: {
          create: [
            { title: 'AI Ethics Keynote', time: '10:00 AM' },
            { title: 'Decentralized Future Workshop', time: '02:00 PM' }
          ]
        },
        categories: {
          connectOrCreate: [
            { where: { name: 'AI' }, create: { name: 'AI' } },
            { where: { name: 'Web3' }, create: { name: 'Web3' } },
            { where: { name: 'Technology' }, create: { name: 'Technology' } }
          ]
        }
      }
    });
    await prisma.event.create({
      data: {
        name: 'Design Masters Workshop',
        description: 'Interactive sessions on minimalist UX and modern motion design. Limited seats.',
        type: 'WORKSHOP',
        swags: 'Sketchbook,Premium Pencil Set',
        location: 'Chelsea Market, New York',
        lat: 40.7423,
        lng: -74.0062,
        date: new Date('2026-07-20'),
        organizerId: admin.id,
        activities: {
          create: [
            { title: 'Rhythm in Spacing', time: '09:00 AM' },
            { title: 'Framer Motion Tips', time: '11:00 AM' }
          ]
        },
        categories: {
          connectOrCreate: [
            { where: { name: 'Design' }, create: { name: 'Design' } },
            { where: { name: 'UI/UX' }, create: { name: 'UI/UX' } }
          ]
        }
      }
    });
    await prisma.event.create({
      data: {
        name: 'Founder Meetup: SF',
        description: 'Networking event for early-stage founders to share ideas and find co-founders.',
        type: 'NETWORKING',
        location: 'South Park, San Francisco',
        lat: 37.7821,
        lng: -122.3926,
        date: new Date('2026-08-05'),
        organizerId: admin.id
      }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Event OS Server running at http://localhost:${PORT}`);
  });
}

startServer();
