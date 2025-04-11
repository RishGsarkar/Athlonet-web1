const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating authentication tokens
const User = require('./models/User'); // Import the User model
const Event = require('./models/Event'); // Import the Event model

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key'; // Replace with a strong, unique secret

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401); // Unauthorized
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); // Forbidden
      req.user = user; // Attach the user payload to the request object
      next(); // Proceed to the next middleware or route handler
    });
  };
  
  // Middleware to check if the user is an admin
  const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.sendStatus(403); // Forbidden
    }
  };

app.use(cors());
app.use(express.json());

// MongoDB connection (as before)
mongoose.connect('mongodb://localhost:27017/sportsCompetition', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// --- Authentication Routes ---

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, age, email, password, phoneNumber } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' }); // 409 Conflict
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = new User({
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' }); // 201 Created
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message }); // 500 Internal Server Error
  }
});

// User Login
app.post('/api/auth/login/user', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email and role 'user'
    const user = await User.findOne({ email, role: 'user' });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Passwords match, create a JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
      res.json({ token, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
    }
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Admin Login
app.post('/api/auth/login/admin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email and role 'admin'
    const admin = await User.findOne({ email, role: 'admin' });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      // Passwords match, create a JWT token
      const token = jwt.sign({ userId: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, role: admin.role });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// --- Admin Routes ---

// Create a new event (Admin protected)
app.post('/api/admin/events', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const { sportName, eventName, date, entryFee, prize, ageGroup, additionalNote, isTeamBased, participantsPerTeam } = req.body;
  
      const newEvent = new Event({
        sportName,
        eventName,
        date,
        entryFee,
        prize,
        ageGroup,
        additionalNote,
        isTeamBased,
        participantsPerTeam,
      });
  
      await newEvent.save();
      res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Error creating event', error: error.message });
    }
  });

// --- Common Event Routes ---

// Get all events
app.get('/api/events', authenticateToken, async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
  });

// --- Edit an existing event by ID (Admin only) ---
app.put('/api/admin/events/:eventId', authenticateAdmin, async (req, res) => {
  const { eventId } = req.params;
  const updatedEventData = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedEventData, { new: true, runValidators: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: 'Error updating event', error: error.message });
  }
});

// --- Delete an event by ID (Admin only) ---
app.delete('/api/admin/events/:eventId', authenticateAdmin, async (req, res) => {
  const { eventId } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});
// Get all events (Admin view)
app.get('/api/admin/events', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events for admin:', error);
      res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
  });
  
// Basic route (as before)
app.get('/', (req, res) => {
  res.send('Hello from the Sports Management Backend!');
});

// --- User Event Registration Route ---

// Register for an event (individual or team)
app.post('/api/events/:eventId/register', authenticateToken, async (req, res) => {
    const { eventId } = req.params;
    const { teamName, teamMembers } = req.body;
    const userId = req.user.userId;
  
    try {
      // Find the event by its ID
      const event = await Event.findById(eventId);
      // Find the user by their ID
      const user = await User.findById(userId);
  
      if (!event || !user) {
        return res.status(404).json({ message: 'Event or user not found' }); // 404 Not Found
      }
  
      // Check if the user is already registered for this event
      const isAlreadyRegistered = event.registeredUsers.some(reg => reg.user.toString() === userId);
      if (isAlreadyRegistered) {
        return res.status(400).json({ message: 'User is already registered for this event' }); // 400 Bad Request
      }
  
      const registrationData = { user: userId };
  
      // Handle team-based registration
      if (event.isTeamBased) {
        if (!teamName || !Array.isArray(teamMembers) || teamMembers.length === 0 || (event.participantsPerTeam && teamMembers.length !== event.participantsPerTeam)) {
          return res.status(400).json({ message: 'Team name and members are required for team-based events, and the team size must match the event requirements' });
        }
        registrationData.teamName = teamName;
        registrationData.teamMembers = teamMembers;
      }
  
      // Add the user to the event's registered users
      event.registeredUsers.push(registrationData);
      await event.save();
  
      // Add the event to the user's registered events
      user.registeredEvents.push(eventId);
      await user.save();
  
      res.status(200).json({ message: 'Successfully registered for the event' }); // 200 OK
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ message: 'Error registering for event', error: error.message });
    }
  });

// --- User Registered Events Route ---

// Get user's registered events
app.get('/api/user/registered-events', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      // Find the user by their ID and populate the 'registeredEvents' field
      const user = await User.findById(userId).populate('registeredEvents');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' }); // 404 Not Found
      }
  
      res.status(200).json(user.registeredEvents); // Send the array of registered events
    } catch (error) {
      console.error('Error fetching registered events:', error);
      res.status(500).json({ message: 'Error fetching registered events', error: error.message });
    }
  });



// Start the server (as before)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});