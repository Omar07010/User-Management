import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    trim: true
  },
  permission: {
    type: [String], // تعديل هنا
    enum: ["READ", "WRITE", "UPDATE", "DELETE", "CREATE", "MANAGE_USERS", "MANAGE_ROLES", "VIEW_REPORTS", "MANAGE_COMMENTS"], // تصحيح "VIEW_REPOETS"
    required: true // تصحيح هنا
  }
});

// إنشاء نموذج من المخطط
const Role = mongoose.model('Role', roleSchema);

export default Role;
