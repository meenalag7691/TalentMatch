import React from 'react';
import { Sparkles, Briefcase, Cpu } from 'lucide-react';

export default function Navbar({ onOpenJobDrawer, onOpenEvaluator, isBackendConnected, activeView, setActiveView }) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo & Details */}
        <div className="navbar-brand">
          <div className="logo-icon-wrapper">
            <Sparkles className="logo-icon" size={22} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">TalentMatch <span className="text-gradient">AI</span></span>
            </div>
            <p className="brand-subtitle">
              Intelligent Resume Parsing & Job Description Matcher
            </p>
          </div>
        </div>

        {/* Center: Main View Navigation Switcher */}
        <div className="nav-view-switcher">
          <button 
            className={`nav-tab-btn ${activeView === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveView('leaderboard')}
            id="nav-leaderboard-btn"
          >
            <span>📊 Leaderboard</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeView === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveView('analyzer')}
            id="nav-analyzer-btn"
          >
            <span>🚀 Upload & Analyze</span>
          </button>
        </div>

        {/* Center: Active Model & Engine */}
        <div className="engine-status-pill">
          <Cpu size={15} className="text-indigo-400" />
          <span className="engine-label">Engine:</span>
          <span className="engine-model">Groq · gpt-oss-120b</span>
          <span 
            className={`status-dot ${isBackendConnected ? 'online' : 'offline'}`}
            title={isBackendConnected ? 'FastAPI Backend Online' : 'Standalone Mode'}
          ></span>
          <span className="backend-tag text-xs">
            {isBackendConnected ? 'API Live' : 'Local'}
          </span>
        </div>

        {/* Right Navigation Actions */}
        <div className="navbar-actions">
          <button 
            id="view-jd-btn"
            className="btn btn-secondary btn-sm"
            onClick={onOpenJobDrawer}
            title="View Amazon SDE-I Job Description"
          >
            <Briefcase size={16} />
            <span>Target Job Spec</span>
          </button>
        </div>
      </div>
    </header>
  );
}

