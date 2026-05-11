import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { View } from '../types';
import { login, saveAuthToken } from '../lib/authApi.js';

interface User {
  _id: string;
  email: string;
  fullName: string;
  profile?: any;
}

interface LoginViewProps {
  setActiveView: (view: View) => void;
}

export default function LoginView({ setActiveView }: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = (await login(email, password)) as User;
      saveAuthToken(user._id, user.email, user.fullName);
    
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
    
      setActiveView('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const remembered = localStorage.getItem('rememberEmail');
      if (remembered) {
        setEmail(remembered);
        setRememberMe(true);
      }
    }, []);

  return (
    <motion.div
      key="login-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-screen"
    >
      {/* Left Side: Brand Imagery */}
      <div className="auth-brand-side">
        <img 
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200" 
          alt="Culinary Excellence" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10">
          <button 
            onClick={() => setActiveView('home')}
            className="auth-back-btn"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Website
          </button>
        </div>

        <div className="relative z-10">
           <h2 className="auth-hero-title">Culinary Experience Starts Here.</h2>
           <p className="auth-hero-desc">
             Join ProCook's central hub for authentic Filipino heritage. Access shared recipes, collaborate with cooks, and build your digital library.
           </p>
        </div>

        <div className="auth-footer-wrap">
           <p className="text-[11px] font-display font-black text-pro-red uppercase tracking-[0.3em]">Registry Access Only</p>
           <p className="text-[10px] font-sans text-white/40 uppercase tracking-widest">© 2026 PROCOOK</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="auth-form-side">
         <div className="form-container">
           <div className="auth-form-header">
             <h3 className="auth-welcome-title">Welcome Back</h3>
             <p className="auth-welcome-desc">Log in to your member account to continue.</p>
           </div>

           <form className="space-y-10" onSubmit={handleLogin}>
              {error && (
                <div className="bg-pro-red/10 border border-pro-red text-pro-red px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="input-group">
                <label className="label-text">Member Email</label>
                <div className="input-wrapper group">
                   <Mail className="w-5 h-5 text-stone-300 group-focus-within:text-pro-red transition-colors" />
                   <input 
                     type="email" 
                     placeholder="chef@procook.ph" 
                     className="input-field"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     disabled={loading}
                   />
                </div>
              </div>

              <div className="input-group">
                <label className="label-text">Password</label>
                <div className="input-wrapper group">
                   <Lock className="w-5 h-5 text-stone-300 group-focus-within:text-pro-red transition-colors" />
                   <input 
                     type={showPassword ? "text" : "password"} 
                     placeholder="••••••••" 
                     className="input-field"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     disabled={loading}
                   />
                   <button 
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="text-stone-300 hover:text-black transition-colors"
                   >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                </div>
              </div>

              <div className="auth-options-row">
                 <label className="auth-checkbox-group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded-sm border-stone-300 text-pro-red focus:ring-pro-red"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                   <span className="auth-checkbox-label">Remember me</span>
                 </label>
                   <button type="button" className="auth-inline-btn" disabled={loading}>Forgot Password?</button>
              </div>

              <button 
                type="submit" 
                className="auth-btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'} {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
           </form>

           <div className="auth-switch-footer">
              <p className="auth-switch-prompt">Not yet registered? <button onClick={() => setActiveView('signup')} className="auth-link">Create an account</button></p>
           </div>
         </div>
      </div>
    </motion.div>
  );
}
