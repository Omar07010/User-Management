import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: mongoose.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  isVerifyEmail: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

export default User;

