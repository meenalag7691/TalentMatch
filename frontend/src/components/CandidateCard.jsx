import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  ChevronRight,
  Star
} from 'lucide-react';

export default function CandidateCard({ candidate, onSelectCandidate, onToggleShortlist, isShortlisted }) {
  const { 
    rank, 
    name, 
    role, 
    score, 
    location, 
    education, 
    fileSource, 
    matchingSkills, 
    missingSkills, 
    finalVerdict,
    status,
    badgeTier
  } = candidate;

  // SVG Gauge calculations
  const radius = 34;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color scheme based on score
  const getScoreColor = (sc) => {
    if (sc >= 70) return '#10b981'; // emerald
    if (sc >= 60) return '#6366f1'; // indigo
    if (sc >= 50) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  const scoreColor = getScoreColor(score);

  return (
    <article className={`candidate-card glass-panel ${badgeTier}`}>
      {/* Top Banner: Rank & Status */}
      <div className="card-top-bar">
        <div className="rank-badge-group">
          <span className={`rank-pill rank-pill-${rank}`}>
            #{rank} {rank === 1 ? 'Top Candidate' : rank === 2 ? 'Strong Contender' : 'Applicant'}
          </span>
          <span className="file-pill" title={`Parsed from ${fileSource}`}>
            <FileText size={12} />
            {fileSource.endsWith('.pdf') ? 'PDF' : 'DOCX'}
          </span>
        </div>

        <button 
          className={`shortlist-btn ${isShortlisted ? 'shortlisted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist(candidate.id);
          }}
          title={isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
        >
          <Star size={16} fill={isShortlisted ? '#f59e0b' : 'none'} color={isShortlisted ? '#f59e0b' : '#94a3b8'} />
        </button>
      </div>

      {/* Main Candidate Header Row with Circular Match Gauge */}
      <div className="card-header-row">
        <div className="candidate-meta">
          <h3 className="candidate-name">{name}</h3>
          <p className="candidate-role">{role}</p>
          
          <div className="meta-subline">
            {location && (
              <span className="meta-item">
                <MapPin size={13} /> {location}
              </span>
            )}
            {education && education.length > 0 && (
              <span className="meta-item education-truncate" title={education[0]}>
                <GraduationCap size={13} /> {education[0].split('—')[0].trim()}
              </span>
            )}
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="score-gauge-wrap" title={`Overall Match: ${score}%`}>
          <svg className="score-svg" width="84" height="84" viewBox="0 0 84 84">
            {/* Background Track Circle */}
            <circle
              cx="42"
              cy="42"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
            />
            {/* Animated Progress Circle */}
            <circle
              cx="42"
              cy="42"
              r={radius}
              fill="transparent"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="progress-circle"
            />
          </svg>
          <div className="gauge-label-inside">
            <span className="score-val" style={{ color: scoreColor }}>{score}</span>
            <span className="score-percent">%</span>
          </div>
        </div>
      </div>

      {/* Matching Skills Section */}
      <div className="skills-block">
        <div className="skills-block-header">
          <div className="skills-title text-emerald">
            <CheckCircle2 size={14} />
            <span>Matching Competencies ({matchingSkills.length})</span>
          </div>
        </div>
        <div className="skills-tags-wrap">
          {matchingSkills.slice(0, 5).map((skill, idx) => (
            <span key={idx} className="pill pill-emerald skill-pill">
              {skill}
            </span>
          ))}
          {matchingSkills.length > 5 && (
            <span className="pill pill-neutral skill-pill-more">
              +{matchingSkills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Missing Skills Section */}
      <div className="skills-block">
        <div className="skills-block-header">
          <div className="skills-title text-rose">
            <AlertCircle size={14} />
            <span>Missing / Growth Areas ({missingSkills.length})</span>
          </div>
        </div>
        <div className="skills-tags-wrap">
          {missingSkills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="pill pill-rose skill-pill">
              {skill}
            </span>
          ))}
          {missingSkills.length > 3 && (
            <span className="pill pill-neutral skill-pill-more">
              +{missingSkills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* AI Recruiter Verdict Callout */}
      <div className="verdict-callout">
        <div className="verdict-icon-row">
          <Sparkles size={14} className="verdict-sparkle" />
          <span className="verdict-heading">AI Recruiter Summary</span>
        </div>
        <p className="verdict-text">"{finalVerdict}"</p>
      </div>

      {/* Footer Action Button */}
      <div className="card-footer">
        <button 
          className="btn btn-outline btn-full"
          onClick={() => onSelectCandidate(candidate)}
          id={`inspect-btn-${candidate.id}`}
        >
          <span>View Deep Match Breakdown</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}
