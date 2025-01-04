import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
  }
});


// Create a model from the schema
const Token = mongoose.model('Token', tokenSchema);

export default Token;