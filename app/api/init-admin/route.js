import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Check if admin already exists
    let admin = await User.findOne({ email: 'chiragchoudhary64@gmail.com' });
    
    if (admin) {
      return NextResponse.json({ 
        message: 'Admin already exists',
        email: admin.email,
        isAdmin: admin.isAdmin
      }, { status: 200 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('123456789', 10);

    // Create admin user
    admin = await User.create({
      email: 'chiragchoudhary64@gmail.com',
      password: hashedPassword,
      name: 'Chirag Choudhary',
      isAdmin: true,
    });

    return NextResponse.json({ 
      message: 'Admin created successfully',
      email: admin.email,
      isAdmin: admin.isAdmin
    }, { status: 201 });
  } catch (error) {
    console.error('Error with admin setup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
