// backend/middlewares/authorizeRoles.js

const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        
        if (!req.user || !req.user.role) {
            return res.status(403).json({ msg: 'Access denied. User role not found.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ msg: `Access denied. Role '${req.user.role}' is not authorized.` });
        }

        next(); // User has the required role, proceed
    };
};

export default authorizeRoles;