import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, decodeAccessToken, logout } from "../utils/auth";

// Define the type for the decoded user object
interface DecodedUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHome, setIsHome] = useState(location.pathname === "/");
  // Explicitly type loggedInUser to be either DecodedUser or null
  const [loggedInUser, setLoggedInUser] = useState<DecodedUser | null>(null);

  useEffect(() => {
    setIsHome(location.pathname === "/");
  }, [location.pathname]);

  const checkAuthStatus = () => {
    if (isAuthenticated()) {
      const decoded = decodeAccessToken();
      // Ensure decoded matches the DecodedUser interface before setting state
      if (decoded && typeof decoded.id === 'string' && typeof decoded.role === 'string') {
        setLoggedInUser(decoded as DecodedUser); // Cast to DecodedUser for type safety
      } else {
        localStorage.removeItem('accessToken');
        setLoggedInUser(null);
      }
    } else {
      setLoggedInUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    window.addEventListener('authStatusChange', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('authStatusChange', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleLogout = async () => {
    const loggedOut = await logout();
    if (loggedOut) {
      setIsOpen(false);
      navigate("/");
    }
  };

  // Add type annotation for 'path'
  const navLinkClass = (path: string) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      location.pathname === path
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  // Add type annotation for 'path'
  const desktopLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? "text-blue-600 font-semibold"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <nav
      className={`${
        isHome ? "absolute" : "sticky top-0"
      } left-0 w-full ${
        isHome ? "bg-transparent" : "bg-white shadow-md"
      } z-50 transition`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/xplorefuture.png"
              alt="Xplorefuture Logo"
              className="h-16 w-16 object-contain drop-shadow-[0_0_8px_white]"
            />
            <span
              className={`text-xl font-bold select-none transition-colors duration-300 ${
                isHome ? "text-white" : "text-blue-600"
              }`}
            >
              Xplorefuture
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`${isHome ? "text-white" : "text-black"} ${desktopLinkClass("/")}`}
            >
              Home
            </Link>
            {loggedInUser ? (
              <>
                {/* Accessing role is now safe because loggedInUser is typed */}
                {loggedInUser.role === 'admin' && (
                  <Link to="/add-institution" className={desktopLinkClass("/add-institution")}>
                    Add Institution
                  </Link>
                )}
                <Link to="/profile" className={desktopLinkClass("/profile")}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
              >
                Login/Register
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden text-3xl focus:outline-none ${isHome ? "text-white" : "text-gray-700 hover:text-blue-600"}`}
            aria-label="Toggle menu"
          >
            {isOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden bg-white border-t overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)} className={navLinkClass("/")}>
          Home
        </Link>
        {loggedInUser ? (
          <>
            {/* Accessing role is now safe because loggedInUser is typed */}
            {loggedInUser.role === 'admin' && (
              <Link to="/add-institution" onClick={() => setIsOpen(false)} className={navLinkClass("/add-institution")}>
                Add Institution
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={navLinkClass("/profile")}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}