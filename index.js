// ----------------------------
// Backend Server - Noely-Rent
// ----------------------------
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// ----------------------------
// Middleware
// ----------------------------
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: 'https://noely-rent.vercel.app', // Vercel frontend
  credentials: true
}));

// ----------------------------
// MongoDB Connection
// ----------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// ----------------------------
// Schemas
// ----------------------------

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['tenant', 'landlord'], default: 'tenant' },
  phone: String
});

const User = mongoose.model('User', userSchema);

// Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  type: String,
  location: String,
  price: Number,
  image: String,
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Property = mongoose.model('Property', propertySchema);

// ----------------------------
// Middleware for JWT Auth
// ----------------------------
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

// ----------------------------
// Routes
// ----------------------------

// Health check
app.get('/', (req, res) => res.send('Noely-Rent Backend Running'));

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'All fields are required' });

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Add Property (only for logged-in landlords)
app.post('/api/properties', authMiddleware, async (req, res) => {
  if (req.user.role !== 'landlord') return res.status(403).json({ message: 'Only landlords can add properties' });

  const { title, type, location, price, image } = req.body;
  if (!title || !type || !location || !price) return res.status(400).json({ message: 'All fields are required' });

  try {
    const property = await Property.create({
      title,
      type,
      location,
      price,
      image,
      agent: req.user.id
    });
    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add property' });
  }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  const properties = await Property.find().populate('agent', 'username email phone');
  res.json(properties);
});

// Get all agents/landlords
app.get('/api/agents', async (req, res) => {
  const agents = await User.find({ role: 'landlord' }).select('username email phone');
  res.json(agents);
});

// ----------------------------
// Start Server
// ----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Noely-Rent Backend running on port ${PORT}`));