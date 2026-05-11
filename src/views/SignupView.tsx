import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, LayoutGrid, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { View } from '../types';
import { signup, saveAuthToken } from '../lib/authApi.js';

interface User {
  _id: string;
  email: string;
  fullName: string;
}

interface SignupViewProps {
  setActiveView: (view: View) => void;
}

export default function SignupView({ setActiveView }: SignupViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = (await signup(fullName, email, password)) as User;
      saveAuthToken(user._id, user.email, user.fullName);
      setActiveView('dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="signup-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-screen"
    >
      {/* Left Side: Brand Imagery */}
      <div className="auth-brand-side">
        <img 
          src="https://images.unsplash.com/photo-1547516508-4c1f9c7c4ec3?auto=format&fit=crop&q=80&w=1200" 
          alt="Culinary Community" 
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
           <h2 className="auth-hero-title">Authentic Flavor Starts Here.</h2>
           <p className="auth-hero-desc">
             Join the largest network of Filipino home cooks. Share heritage recipes and help us document the richness of local cuisine.
           </p>
        </div>

        <div className="auth-footer-wrap">
           <p className="text-[11px] font-display font-black text-pro-red uppercase tracking-[0.3em]">Public Registry Open</p>
           <p className="text-[10px] font-sans text-white/40 uppercase tracking-widest">© 2026 PROCOOK HUB</p>
        </div>
      </div>

      {/* Right Side: Sign Up Form */}
      <div className="auth-form-side">
         <div className="form-container">
           <div className="auth-form-header">
             <h3 className="auth-welcome-title">Create Profile</h3>
             <p className="auth-welcome-desc">Register your details to join the community.</p>
           </div>

           <form className="space-y-8" onSubmit={handleSignup}>
              {error && (
                <div className="bg-pro-red/10 border border-pro-red text-pro-red px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="input-group">
                <label className="label-text">Full Name</label>
                <div className="input-wrapper group">
                   <LayoutGrid className="w-5 h-5 text-stone-300 group-focus-within:text-pro-red transition-colors" />
                   <input 
                     type="text" 
                     placeholder="Juan Dela Cruz" 
                     className="input-field"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     required
                     disabled={loading}
                   />
                </div>
              </div>

              <div className="input-group">
                <label className="label-text">Email Address</label>
                <div className="input-wrapper group">
                   <Mail className="w-5 h-5 text-stone-300 group-focus-within:text-pro-red transition-colors" />
                   <input 
                     type="email" 
                     placeholder="juan@email.com" 
                     className="input-field"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     disabled={loading}
                   />
                </div>
              </div>

              <div className="input-group">
                <label className="label-text">Create Password</label>
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

              <button 
                type="submit"
                className="auth-btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'REGISTERING...' : 'REGISTER NOW'} {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
           </form>

           <div className="auth-switch-footer">
              <p className="auth-switch-prompt">Already a member? <button onClick={() => setActiveView('login')} className="auth-link">Log in here</button></p>
           </div>
         </div>
      </div>
    </motion.div>
  );
}
