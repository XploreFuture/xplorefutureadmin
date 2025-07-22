import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming you have a User model

const protect = async (req, res, next) => {
  let token;

  console.log("[AUTH MIDDLEWARE] Entering protect middleware.");

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log("[AUTH MIDDLEWARE] Token found:", token ? "YES" : "NO");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[AUTH MIDDLEWARE] Token decoded:", decoded);

      // Attach user from the token payload to req.user (excluding password)
      // Ensure your User model has 'id' or '_id' in its schema and 'role'
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.error("[AUTH MIDDLEWARE] User not found for decoded ID:", decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      console.log("[AUTH MIDDLEWARE] User attached to req.user:", req.user._id, "Role:", req.user.role);
      next(); // Proceed to the next middleware/route handler

    } catch (error) {
      console.error("[AUTH MIDDLEWARE] Token verification failed:", error.message);
      // If the token is invalid or expired, clear any potential token on the client side
      // and send an appropriate error response.
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log("[AUTH MIDDLEWARE] No token found in request headers.");
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;