import React from 'react';
import { 
  X, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  CheckCircle, 
  Star, 
  ListChecks,
  MapPin,
  Clock
} from 'lucide-react';

export default function JobDescriptionDrawer({ job, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside 
        className="drawer-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Job Description Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-wrap">
              <Building2 size={20} />
            </div>
            <div>
              <span className="pill pill-cyan">Target Role Specification</span>
              <h3 className="drawer-title">{job.title}</h3>
              <p className="drawer-subtitle">
                {job.company} · {job.division}
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="drawer-quick-bar">
          <div className="quick-item">
            <Clock size={14} />
            <span><strong>Experience:</strong> {job.minimumExperience}</span>
          </div>
          <div className="quick-item">
            <MapPin size={14} />
            <span>{job.location}</span>
          </div>
          <div className="quick-item">
            <Briefcase size={14} />
            <span>{job.employmentType}</span>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="drawer-body">
          {/* Section 1: Education Requirements */}
          <div className="drawer-section">
            <h4 className="drawer-section-heading">
              <GraduationCap size={16} /> Eligible Education Degrees
            </h4>
            <ul className="drawer-list">
              {job.educationRequirements.map((item, idx) => (
                <li key={idx} className="drawer-list-item">
                  <CheckCircle size={14} className="text-emerald" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Basic Qualifications */}
          <div className="drawer-section">
            <h4 className="drawer-section-heading">
              <ListChecks size={16} /> Basic Qualifications (Required)
            </h4>
            <ul className="drawer-list">
              {job.basicQualifications.map((item, idx) => (
                <li key={idx} className="drawer-list-item">
                  <div className="bullet-point bullet-emerald"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Preferred Qualifications */}
          <div className="drawer-section">
            <h4 className="drawer-section-heading">
              <Star size={16} /> Preferred Qualifications
            </h4>
            <ul className="drawer-list">
              {job.preferredQualifications.map((item, idx) => (
                <li key={idx} className="drawer-list-item">
                  <div className="bullet-point bullet-indigo"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Key Responsibilities */}
          <div className="drawer-section">
            <h4 className="drawer-section-heading">
              <Briefcase size={16} /> Key Job Responsibilities
            </h4>
            <ul className="drawer-list">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="drawer-list-item">
                  <div className="bullet-point bullet-cyan"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button className="btn btn-outline btn-full" onClick={onClose}>
            Back to Candidate Ranks
          </button>
        </div>
      </aside>
    </div>
  );
}
