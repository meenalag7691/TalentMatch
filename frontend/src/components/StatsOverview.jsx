import React from 'react';
import { Users, Trophy, Percent, Building2, ArrowUpRight } from 'lucide-react';

export default function StatsOverview({ candidates, onOpenJobDrawer }) {
  const totalCandidates = candidates.length;
  const topCandidate = candidates.reduce((max, c) => c.score > max.score ? c : max, candidates[0] || { name: 'None', score: 0 });
  const avgScore = totalCandidates > 0 
    ? (candidates.reduce((sum, c) => sum + c.score, 0) / totalCandidates).toFixed(1)
    : 0;

  return (
    <section className="stats-grid">
      {/* Stat 1: Total Candidates */}
      <div className="stat-card glass-panel">
        <div className="stat-card-header">
          <span className="stat-label">Resumes Analyzed</span>
          <div className="stat-icon-wrap icon-indigo">
            <Users size={18} />
          </div>
        </div>
        <div className="stat-value-row">
          <span className="stat-number">{totalCandidates}</span>
          <span className="stat-badge pill-neutral">All Parsed</span>
        </div>
        <p className="stat-subtext">Automated PDF & DOCX extraction</p>
      </div>

      {/* Stat 2: Top Ranked Fit */}
      <div className="stat-card glass-panel highlight-gold">
        <div className="stat-card-header">
          <span className="stat-label">Top Recommendation</span>
          <div className="stat-icon-wrap icon-gold">
            <Trophy size={18} />
          </div>
        </div>
        <div className="stat-value-row">
          <span className="stat-number text-gradient">{topCandidate.score}%</span>
          <span className="stat-badge pill-emerald">Rank #1</span>
        </div>
        <p className="stat-subtext">
          <strong>{topCandidate.name}</strong> · Strong match
        </p>
      </div>

      {/* Stat 3: Average Match Score */}
      <div className="stat-card glass-panel">
        <div className="stat-card-header">
          <span className="stat-label">Average Cohort Fit</span>
          <div className="stat-icon-wrap icon-cyan">
            <Percent size={18} />
          </div>
        </div>
        <div className="stat-value-row">
          <span className="stat-number">{avgScore}%</span>
          <span className="stat-badge pill-cyan">Across {totalCandidates}</span>
        </div>
        <p className="stat-subtext">Benchmarked against Amazon SDE-I</p>
      </div>

      {/* Stat 4: Target Opening */}
      <div className="stat-card glass-panel click-card" onClick={onOpenJobDrawer}>
        <div className="stat-card-header">
          <span className="stat-label">Target Role</span>
          <div className="stat-icon-wrap icon-rose">
            <Building2 size={18} />
          </div>
        </div>
        <div className="stat-value-row">
          <span className="stat-role-title">Amazon SDE-I</span>
          <ArrowUpRight size={18} className="text-secondary" />
        </div>
        <p className="stat-subtext">AWS & Distributed Systems · Click to view</p>
      </div>
    </section>
  );
}
