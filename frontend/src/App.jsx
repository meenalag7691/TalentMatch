import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import CandidateCard from './components/CandidateCard';
import CandidateModal from './components/CandidateModal';
import JobDescriptionDrawer from './components/JobDescriptionDrawer';
import ResumeAnalyzerModal from './components/ResumeAnalyzerModal';
import SingleResumeAnalyzer from './components/SingleResumeAnalyzer';
import { initialCandidates, jobDescription } from './data/candidateData';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Check, 
  Sparkles, 
  Star,
  RefreshCw,
  FileCheck,
  UploadCloud,
  LayoutGrid
} from 'lucide-react';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('leaderboard'); // 'leaderboard' | 'analyzer'
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // 'all' | 'top' | 'mid' | 'low' | 'shortlisted'
  const [sortBy, setSortBy] = useState('score-desc'); // 'score-desc' | 'score-asc' | 'name-asc'
  const [toastMessage, setToastMessage] = useState(null);

  // Check backend and fetch candidates on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) {
          setIsBackendConnected(true);
          return fetch('/api/candidates');
        }
        throw new Error('API not ok');
      })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCandidates(data);
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleShortlist = (id) => {
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed candidate from shortlist");
      } else {
        next.add(id);
        showToast("Added candidate to shortlist ⭐");
      }
      return next;
    });
  };

  const handleAddCandidate = (newCandidate) => {
    setCandidates((prev) => {
      const updated = [...prev, newCandidate];
      // re-sort by score and update ranks
      updated.sort((a, b) => b.score - a.score);
      return updated.map((c, i) => ({
        ...c,
        rank: i + 1
      }));
    });
    showToast(`Evaluated & added ${newCandidate.name} (Score: ${newCandidate.score}%)`);
  };

  const handleResetCohort = async () => {
    if (isBackendConnected) {
      try {
        await fetch('/api/reset-candidates', { method: 'POST' });
      } catch (e) {
        // ignore
      }
    }
    setCandidates(initialCandidates);
    setSearchQuery('');
    setTierFilter('all');
    showToast("Reset cohort to original Day 5 candidates");
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((candidate) => {
        // Search query: match name, skills, or role
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = candidate.name.toLowerCase().includes(q);
          const matchRole = candidate.role.toLowerCase().includes(q);
          const matchSkills = candidate.matchingSkills.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchRole && !matchSkills) return false;
        }

        // Tier filter
        if (tierFilter === 'top' && candidate.score < 70) return false;
        if (tierFilter === 'mid' && (candidate.score < 60 || candidate.score >= 70)) return false;
        if (tierFilter === 'low' && candidate.score >= 60) return false;
        if (tierFilter === 'shortlisted' && !shortlistedIds.has(candidate.id)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score-desc') return b.score - a.score;
        if (sortBy === 'score-asc') return a.score - b.score;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [candidates, searchQuery, tierFilter, sortBy, shortlistedIds]);

  return (
    <div className="app-layout">
      {/* Toast alert */}
      {toastMessage && (
        <div className="toast-notification animate-fade-in">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar 
        onOpenJobDrawer={() => setIsJobDrawerOpen(true)}
        onOpenEvaluator={() => setIsEvaluatorOpen(true)}
        isBackendConnected={isBackendConnected}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="main-content-container">
        {activeView === 'analyzer' ? (
          /* Dedicated Single Resume Analysis Studio View */
          <SingleResumeAnalyzer 
            onCandidateAdded={handleAddCandidate}
            onNavigateToLeaderboard={() => setActiveView('leaderboard')}
          />
        ) : (
          /* Leaderboard & Cohort View */
          <>
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-header-split">
                <div className="hero-content">
                  <div className="hero-pill-badge">
                    <span className="pulsing-radar"></span>
                    <span>Automated Semantic Evaluation Engine</span>
                  </div>
                  <h1 className="hero-title">
                    Candidate Screening & <span className="text-gradient">Match Intelligence</span>
                  </h1>
                  <p className="hero-description">
                    Real-time analysis powered by <strong>Groq LLMs</strong> and <strong>Pydantic v2 schemas</strong>. 
                    Resumes in PDF/DOCX formats are parsed, evaluated against Amazon's SDE-I requirements, and ranked automatically.
                  </p>
                </div>

                <div className="hero-action-box">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveView('analyzer')}
                    id="hero-upload-btn"
                  >
                    <UploadCloud size={18} />
                    <span>Upload New Resume</span>
                  </button>
                </div>
              </div>
            </section>


        {/* Key Metrics / Stats Overview */}
        <StatsOverview 
          candidates={candidates}
          onOpenJobDrawer={() => setIsJobDrawerOpen(true)}
        />

        {/* Filter & Search Bar */}
        <section className="filter-toolbar glass-panel">
          {/* Search Input */}
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              className="search-input"
              placeholder="Search candidate name or skill (e.g. C++, AWS, Docker, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="candidate-search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Tier Filters */}
          <div className="tier-filter-pills">
            <button 
              className={`filter-btn ${tierFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTierFilter('all')}
            >
              All ({candidates.length})
            </button>
            <button 
              className={`filter-btn ${tierFilter === 'top' ? 'active' : ''}`}
              onClick={() => setTierFilter('top')}
            >
              Top Tier (≥70%)
            </button>
            <button 
              className={`filter-btn ${tierFilter === 'mid' ? 'active' : ''}`}
              onClick={() => setTierFilter('mid')}
            >
              Mid Tier (60-69%)
            </button>
            <button 
              className={`filter-btn ${tierFilter === 'low' ? 'active' : ''}`}
              onClick={() => setTierFilter('low')}
            >
              Needs Review (&lt;60%)
            </button>
            <button 
              className={`filter-btn ${tierFilter === 'shortlisted' ? 'active' : ''}`}
              onClick={() => setTierFilter('shortlisted')}
            >
              <Star size={13} fill={tierFilter === 'shortlisted' ? '#f59e0b' : 'none'} />
              Shortlisted ({shortlistedIds.size})
            </button>
          </div>

          {/* Sort Selector & Reset */}
          <div className="sort-actions-wrap">
            <div className="sort-select-box">
              <ArrowUpDown size={14} className="sort-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
                id="sort-select"
              >
                <option value="score-desc">Highest Match First</option>
                <option value="score-asc">Lowest Match First</option>
                <option value="name-asc">Candidate Name (A-Z)</option>
              </select>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleResetCohort}
              title="Reset candidates"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </section>

        {/* Candidate Results Grid */}
        <section className="candidates-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                Ranked Candidates
                <span className="count-tag">Showing {filteredCandidates.length} of {candidates.length}</span>
              </h2>
            </div>
            <div className="legend-pills">
              <span className="legend-item"><span className="legend-dot dot-emerald"></span> ≥70% Strong Match</span>
              <span className="legend-item"><span className="legend-dot dot-indigo"></span> 60-69% Good Fit</span>
              <span className="legend-item"><span className="legend-dot dot-amber"></span> 50-59% Moderate</span>
              <span className="legend-item"><span className="legend-dot dot-rose"></span> &lt;50% Review</span>
            </div>
          </div>

          {filteredCandidates.length > 0 ? (
            <div className="candidates-grid">
              {filteredCandidates.map((candidate) => (
                <CandidateCard 
                  key={candidate.id}
                  candidate={candidate}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                  onToggleShortlist={handleToggleShortlist}
                  isShortlisted={shortlistedIds.has(candidate.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <FileCheck size={42} className="text-secondary mb-2" />
              <h3>No candidates match your current filters</h3>
              <p className="text-secondary">Try searching for a different skill or reset the active filter tier.</p>
              <button className="btn btn-primary mt-4" onClick={() => { setSearchQuery(''); setTierFilter('all'); }}>
                Reset Filters
              </button>
            </div>
          )}
        </section>
          </>
        )}
      </main>


      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-inner">
          <p className="footer-text">
            Day 5 AI Engineering · Automated Resume Parser & Recruiter Intelligence · Powered by Groq Cloud & Pydantic
          </p>
        </div>
      </footer>

      {/* Candidate Deep Inspection Modal */}
      {selectedCandidate && (
        <CandidateModal 
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          isShortlisted={shortlistedIds.has(selectedCandidate.id)}
          onToggleShortlist={handleToggleShortlist}
        />
      )}

      {/* Target Job Description Drawer */}
      <JobDescriptionDrawer 
        job={jobDescription}
        isOpen={isJobDrawerOpen}
        onClose={() => setIsJobDrawerOpen(false)}
      />

      {/* Resume Analyzer Simulator Modal */}
      <ResumeAnalyzerModal 
        isOpen={isEvaluatorOpen}
        onClose={() => setIsEvaluatorOpen(false)}
        onAddCandidate={handleAddCandidate}
        isBackendConnected={isBackendConnected}
      />

    </div>
  );
}
