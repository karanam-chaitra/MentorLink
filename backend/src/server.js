require('dotenv').config();
const mongoose = require('mongoose');
const { app } = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/mentorlink';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.warn('MongoDB unavailable, running in memory mode:', err.message));

app.listen(PORT, () => {
  console.log(`MentorLink Backend running on port ${PORT}`);
});
