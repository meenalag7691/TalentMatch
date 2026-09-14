import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Mail, 
  Phone, 
  MapPin, 
  FileCode, 
  Star,
  Download
} from 'lucide-react';

export default function CandidateModal({ candidate, onClose, isShortlisted, onToggleShortlist }) {
  const [activeTab, setActiveTab] = useState('verdict'); // 'verdict' | 'skills' | 'timeline' | 'provenance'

  if (!candidate) return null;

  const {
    id,
    name,
    role,
    score,
    rank,
    email,
    phone,
    location,
    fileSource,
    matchingSkills,
    missingSkills,
    experienceRequirementMet,
    finalVerdict,
    education,
    experiences,
    projects
  } = candidate;

  // Score color
  const getScoreColor = (sc) => {
    if (sc >= 70) return '#10b981';
    if (sc >= 60) return '#6366f1';
    if (sc >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${name.replace(/\s+/g, '_')}_evaluation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-rank-row">
              <span className="pill pill-emerald">Rank #{rank} Match</span>
              <span className="pill pill-neutral">{fileSource}</span>
            </div>
            <h2 className="modal-candidate-name">{name}</h2>
            <p className="modal-candidate-role">{role}</p>

            {/* Contact metadata */}
            <div className="modal-contact-row">
              {email && (
                <span className="modal-meta-item">
                  <Mail size={13} /> {email}
                </span>
              )}
              {phone && (
                <span className="modal-meta-item">
                  <Phone size={13} /> {phone}
                </span>
              )}
              {location && (
                <span className="modal-meta-item">
                  <MapPin size={13} /> {location}
                </span>
              )}
            </div>
          </div>

          {/* Right score & controls */}
          <div className="modal-header-right">
            <div className="modal-score-badge" style={{ borderColor: getScoreColor(score) }}>
              <span className="modal-score-num" style={{ color: getScoreColor(score) }}>{score}%</span>
              <span className="modal-score-sub">Overall Match</span>
            </div>
            <button 
              className="modal-close-btn" 
              onClick={onClose}
              id="close-modal-btn"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs-bar">
          <button 
            className={`modal-tab ${activeTab === 'verdict' ? 'active' : ''}`}
            onClick={() => setActiveTab('verdict')}
          >
            <Sparkles size={15} />
            <span>AI Recruiter Verdict</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <CheckCircle2 size={15} />
            <span>Skills Breakdown ({matchingSkills.length}/{matchingSkills.length + missingSkills.length})</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Briefcase size={15} />
            <span>Experience & Projects</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'provenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('provenance')}
          >
            <FileCode size={15} />
            <span>Parser Metadata</span>
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="modal-body-scroll">
          {/* TAB 1: AI VERDICT */}
          {activeTab === 'verdict' && (
            <div className="tab-pane animate-fade-in">
              <div className="verdict-highlight-box">
                <div className="verdict-tag-row">
                  <Sparkles size={18} className="text-indigo-400" />
                  <h4>Executive Evaluation</h4>
                </div>
                <blockquote className="verdict-quote">
                  "{finalVerdict}"
                </blockquote>
              </div>

              <div className="metrics-split-grid">
                <div className="metric-box glass-panel">
                  <span className="metric-box-label">Experience Requirement</span>
                  <div className="metric-box-value text-emerald">
                    <CheckCircle2 size={18} />
                    <span>{experienceRequirementMet ? 'Requirement Satisfied (0-1 yrs)' : 'Experience Gap'}</span>
                  </div>
                  <p className="metric-box-sub">Matches Amazon SDE-I fresher/entry-level qualification</p>
                </div>

                <div className="metric-box glass-panel">
                  <span className="metric-box-label">Skills Coverage Ratio</span>
                  <div className="metric-box-value">
                    <span style={{ color: getScoreColor(score) }}>
                      {Math.round((matchingSkills.length / (matchingSkills.length + missingSkills.length)) * 100)}%
                    </span>
                    <span className="text-secondary text-sm">
                      ({matchingSkills.length} of {matchingSkills.length + missingSkills.length} competencies)
                    </span>
                  </div>
                  <p className="metric-box-sub">Calculated via semantic ontology mapping</p>
                </div>
              </div>

              {/* Education snippet */}
              <div className="detail-section">
                <h5 className="section-title">
                  <GraduationCap size={16} /> Extracted Education
                </h5>
                <div className="education-list">
                  {education && education.map((edu, idx) => (
                    <div key={idx} className="education-item pill-neutral">
                      {edu}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS BREAKDOWN */}
          {activeTab === 'skills' && (
            <div className="tab-pane animate-fade-in">
              <div className="skills-dual-column">
                {/* Matching Skills */}
                <div className="skills-column column-match">
                  <div className="col-header text-emerald">
                    <CheckCircle2 size={18} />
                    <h4>Matching Competencies ({matchingSkills.length})</h4>
                  </div>
                  <p className="col-sub">Skills successfully identified in candidate's profile</p>
                  <div className="tags-container">
                    {matchingSkills.map((sk, idx) => (
                      <span key={idx} className="pill pill-emerald skill-tag-lg">
                        <CheckCircle2 size={13} /> {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="skills-column column-missing">
                  <div className="col-header text-rose">
                    <AlertCircle size={18} />
                    <h4>Recommended Growth Areas ({missingSkills.length})</h4>
                  </div>
                  <p className="col-sub">Desired by Amazon SDE-I job specification but not highlighted</p>
                  <div className="tags-container">
                    {missingSkills.map((sk, idx) => (
                      <span key={idx} className="pill pill-rose skill-tag-lg">
                        <AlertCircle size={13} /> {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPERIENCE & PROJECTS */}
          {activeTab === 'timeline' && (
            <div className="tab-pane animate-fade-in">
              {/* Experiences */}
              <div className="detail-section">
                <h5 className="section-title">
                  <Briefcase size={16} /> Work History & Internships
                </h5>
                {experiences && experiences.length > 0 ? (
                  <div className="timeline-list">
                    {experiences.map((exp, idx) => (
                      <div key={idx} className="timeline-item glass-panel">
                        <div className="timeline-title-row">
                          <strong className="timeline-role">{exp.role}</strong>
                          <span className="pill pill-neutral">{exp.duration}</span>
                        </div>
                        <div className="timeline-company text-indigo-300">{exp.company}</div>
                        <p className="timeline-desc">{exp.description}</p>
                        {exp.skillsUsed && (
                          <div className="timeline-skills">
                            {exp.skillsUsed.map((s, i) => (
                              <span key={i} className="pill pill-cyan">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary italic">No structured formal experience recorded (Academic / Fresher).</p>
                )}
              </div>

              {/* Projects */}
              <div className="detail-section mt-4">
                <h5 className="section-title">
                  <FolderGit2 size={16} /> Extracted Projects
                </h5>
                {projects && projects.length > 0 ? (
                  <div className="projects-grid">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="project-card glass-panel">
                        <strong className="project-title">{proj.title}</strong>
                        <p className="project-desc">{proj.description}</p>
                        {proj.tech && (
                          <div className="project-tech-tags">
                            {proj.tech.map((t, i) => (
                              <span key={i} className="pill pill-neutral">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary italic">No dedicated project sections parsed.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROVENANCE */}
          {activeTab === 'provenance' && (
            <div className="tab-pane animate-fade-in">
              <div className="provenance-panel glass-panel">
                <h5 className="section-title">
                  <FileCode size={16} /> Automated Pipeline Audit Log
                </h5>
                <table className="provenance-table">
                  <tbody>
                    <tr>
                      <td className="prop-name">Source Resume File</td>
                      <td className="prop-val font-mono">{fileSource}</td>
                    </tr>
                    <tr>
                      <td className="prop-name">Target Job Specification</td>
                      <td className="prop-val">Amazon Software Development Engineer I</td>
                    </tr>
                    <tr>
                      <td className="prop-name">LLM Reasoning Model</td>
                      <td className="prop-val font-mono">openai/gpt-oss-120b (via Groq Cloud)</td>
                    </tr>
                    <tr>
                      <td className="prop-name">Document Parser Library</td>
                      <td className="prop-val">{fileSource.endsWith('.pdf') ? 'pypdf (Python)' : 'python-docx (Python)'}</td>
                    </tr>
                    <tr>
                      <td className="prop-name">Schema Validation</td>
                      <td className="prop-val">Pydantic v2.13 BaseModel JSON Schema</td>
                    </tr>
                    <tr>
                      <td className="prop-name">Calculated Score</td>
                      <td className="prop-val font-bold" style={{ color: getScoreColor(score) }}>{score}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <button 
            className={`btn ${isShortlisted ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onToggleShortlist(id)}
          >
            <Star size={16} fill={isShortlisted ? '#ffffff' : 'none'} />
            <span>{isShortlisted ? 'Shortlisted Candidate' : 'Shortlist Candidate'}</span>
          </button>

          <button className="btn btn-secondary" onClick={handleExportJson}>
            <Download size={16} />
            <span>Export JSON Dossier</span>
          </button>

          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
