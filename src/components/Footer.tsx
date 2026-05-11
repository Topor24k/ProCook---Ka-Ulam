import { View } from '../types';

interface FooterProps {
  activeView: View;
  setActiveView: (view: View) => void;
  scrollToSection: (id: string) => void;
}

export default function Footer({ activeView, setActiveView, scrollToSection }: FooterProps) {
  return (
    <footer className="footer-bar">
      <div className="footer-content">
         <div className="footer-brand-section">
            <h1 className="footer-logo">PROCOOK</h1>
            <nav className="footer-nav">
               {['HOME', 'ASK KA-ULAM', 'RECIPES', 'HOW IT WORKS'].map(l => (
                 <button 
                   key={l} 
                   onClick={() => scrollToSection(l.toLowerCase().replace(/ /g, '-'))} 
                   className="nav-link text-white/40 hover:text-white"
                 >
                   {l}
                 </button>
               ))}
               <button 
                 onClick={() => setActiveView('about')} 
                 className={`nav-link ${
                   activeView === 'about' ? 'text-pro-red' : 'text-white/40 hover:text-white'
                 }`}
               >
                 ABOUT US
               </button>
            </nav>
         </div>
         
         <div className="footer-info-section">
            <p className="footer-copyright">© 2026 ProCook Intelligence. Built with semantic AI.</p>
            <div className="footer-socials">
               {['Instagram', 'TikTok', 'X'].map(s => (
                 <a key={s} href="#" className="social-link">{s}</a>
               ))}
            </div>
         </div>
      </div>
    </footer>
  );
}
