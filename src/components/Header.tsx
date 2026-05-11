import { View } from '../types';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  scrollToSection: (id: string) => void;
}

export default function Header({ activeView, setActiveView, scrollToSection }: HeaderProps) {
  return (
    <header className="header-bar">
      <div className="header-container">
        <div className="header-left">
          <button 
            onClick={() => setActiveView('home')}
            className="logo-text"
          >
            PROCOOK
          </button>
          <nav className="nav-menu">
            {['HOME', 'ASK KA-ULAM', 'RECIPES', 'HOW IT WORKS'].map((link) => (
              <button 
                key={link} 
                onClick={() => scrollToSection(link.toLowerCase().replace(/ /g, '-'))}
                className="nav-link"
              >
                {link}
              </button>
            ))}
            <button 
              onClick={() => setActiveView('about')}
              className={`nav-link ${activeView === 'about' ? 'active' : ''}`}
            >
              ABOUT US
            </button>
          </nav>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setActiveView('login')}
            className="login-link"
          >
            LOGIN
          </button>
          <button 
            onClick={() => setActiveView('signup')}
            className="signup-button"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </header>
  );
}
