import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function verifyAuth(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return { authenticated: false, user: null };
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        isAdmin: decoded.isAdmin,
      },
    };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

export function requireAuth(request) {
  const auth = verifyAuth(request);
  if (!auth.authenticated) {
    throw new Error('Authentication required');
  }
  return auth.user;
}

export function requireAdmin(request) {
  const user = requireAuth(request);
  if (!user.isAdmin) {
    throw new Error('Admin privileges required');
  }
  return user;
}
