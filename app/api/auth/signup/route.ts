import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidEmail, isValidPassword, isValidPhone, isValidFullName, isEmailUnique } from '@/lib/validations';

// Check if dev mode is enabled
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      full_name, 
      email, 
      country, 
      city, 
      mobile_number, 
      password 
    } = body;

    // Validate inputs
    if (!full_name || !email || !country || !city || !mobile_number || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    if (!isValidPhone(mobile_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (!isValidFullName(full_name)) {
      return NextResponse.json(
        { error: 'Please enter your first and last name' },
        { status: 400 }
      );
    }

    // Check if email is unique
    const emailExists = !(await isEmailUnique(email));
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Register user with Supabase Auth
    let authData;
    let authError;

    if (DEV_MODE) {
      // In dev mode, use admin API to create a user directly (bypassing email verification)
      console.log("Using DEV MODE for user creation - bypassing email verification");
      const adminAuthResponse = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
      });
      
      authData = adminAuthResponse.data;
      authError = adminAuthResponse.error;
    } else {
      // Normal signup flow with email verification
      const signUpResponse = await supabase.auth.signUp({
        email,
        password,
      });
      
      authData = signUpResponse.data;
      authError = signUpResponse.error;
    }

    if (authError) {
      // Handle specific error types
      if (authError.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many signup attempts. Please try again later or use a different email address.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user || !authData.user.id) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    try {
      // Insert user data into database using admin client to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([
          { 
            id: authData.user.id, 
            full_name, 
            email, 
            country, 
            city, 
            mobile_number,
            account_type: 0 // Default account type as required
          }
        ]);

      if (error) {
        // Log the detailed error for debugging
        console.error('Supabase insert error:', error);
        
        // If database insert fails, try to clean up auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Failed to clean up auth user after database insert error:', deleteError);
        }
        
        return NextResponse.json(
          { error: error.message || 'Failed to create user profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        user: authData.user,
        devMode: DEV_MODE
      });
    } catch (insertError) {
      console.error('Error inserting user data:', insertError);
      
      // If insert fails with exception, try to clean up auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Failed to clean up auth user after exception:', deleteError);
      }
      
      return NextResponse.json(
        { error: insertError instanceof Error ? insertError.message : 'Failed to create user profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 