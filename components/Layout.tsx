import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, LayoutDashboard, Upload, Settings, Home, LogIn, LogOut, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { signInWithEmail, signUpWithEmail } = useAppContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (isSigningUp) {
            const { data, error: signUpError } = await signUpWithEmail(fullName, email, password);
            if (signUpError) {
                setError(signUpError.message);
            } else if (data.user && data.user.identities?.length === 0) {
                 setMessage('Please confirm your email address to complete registration.');
                 setTimeout(onClose, 3000);
            } else if (data.user) {
                onClose();
            }
        } else {
            const { error: signInError } = await signInWithEmail(email, password);
            if (signInError) {
                setError(signInError.message);
            } else {
                onClose();
            }
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-2">{isSigningUp ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{isSigningUp ? 'Join CareerSpark to get started.' : 'Sign in to access your dashboard.'}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSigningUp && (
                             <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"/>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"/>
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {message && <p className="text-green-500 text-sm text-center">{message}</p>}

                        <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center">
                            {loading ? <Loader className="animate-spin" /> : (isSigningUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>
                    
                    <p className="text-center text-sm mt-6">
                        {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsSigningUp(!isSigningUp)} className="font-semibold text-purple-500 hover:underline ml-1">
                            {isSigningUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, session, signOut, isAuthModalOpen, openAuthModal, closeAuthModal } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', text: 'Home', icon: <Home className="h-5 w-5" /> },
    { to: '/upload', text: 'Upload', icon: <Upload className="h-5 w-5" />, auth: true },
    { to: '/dashboard', text: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, auth: true },
    { to: '/settings', text: 'Settings', icon: <Settings className="h-5 w-5" />, auth: true },
  ];
  
  const accessibleNavLinks = navLinks.filter(link => !link.auth || session);

  const MobileNav = () => (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-16 left-0 right-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg shadow-lg md:hidden z-40 p-4"
      >
        <nav className="flex flex-col space-y-2">
          {accessibleNavLinks.map(link => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 ${isActive ? 'bg-purple-200 dark:bg-purple-800 font-semibold' : ''}`}>
              {link.icon}
              {link.text}
            </NavLink>
          ))}
        </nav>
      </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
                  <defs>
                      <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="21">
                          <stop offset="0%" stopColor="#8B5CF6"/>
                          <stop offset="100%" stopColor="#14B8A6"/>
                      </linearGradient>
                  </defs>
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#logoGrad)"/>
              </svg>
              <span className="bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">CareerSpark</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              {accessibleNavLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm font-medium transition-colors hover:text-purple-500 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {link.text}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              {session ? (
                  <button onClick={signOut} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden md:block"><LogOut className="h-5 w-5"/></button>
              ) : (
                  <button onClick={openAuthModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden md:block"><LogIn className="h-5 w-5"/></button>
              )}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>{isMenuOpen && <MobileNav />}</AnimatePresence>
      </header>
      
      <AnimatePresence>
        {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}
      </AnimatePresence>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900/50 py-4 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 CareerSpark AI. All rights reserved by Sahil Shaikh.
        </div>
      </footer>
    </div>
  );
};

export default Layout;