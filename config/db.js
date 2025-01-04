import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    // محاولة الاتصال بقاعدة البيانات
    await mongoose.connect(DB_URI);
    console.log('connected successfully with MongoDB');
  } catch (err) {
    // التعامل مع الأخطاء في حالة فشل الاتصال
    console.error('Faild to connect to db', err);
    process.exit(1); // إيقاف العملية في حال فشل الاتصال
  }
}

export default  connectDB;