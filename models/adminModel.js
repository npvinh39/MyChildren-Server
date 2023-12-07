const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    last_name: {
        type: String,
        required: true
    },
    first_name:
    {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "inactive"  // inactive, activated, blocked
    },
    role: {
        type: String,
        default: 'staff'
    }
},
    {
        timestamps: true,
    }
);

// Define the admin schema based on the user schema
const adminSchema = new Schema(userSchema);

// Set the role to 'admin' for the admin schema
// adminSchema.path('role').default('admin');

// Create the admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
