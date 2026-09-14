import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileCheck, 
  FileType, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Play, 
  Loader2, 
  Download, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

const JOB_PRESETS = [
  {
    id: "amazon-sde1",
    label: "Amazon SDE-I (Default)",
    title: "Software Development Engineer I (SDE-I) at Amazon",
    description: `Software Development Engineer I (SDE-I) at Amazon.
Key Responsibilities:
- Design and develop scalable solutions using cloud-native architectures and microservices.
- Write clean, maintainable code following best practices in Java, Python, C++, or Go.
- Participate in code reviews and operational on-call duties.
- Build and maintain resilient distributed systems that are scalable and fault-tolerant.

Basic Qualifications:
- Experience with at least one general-purpose programming language (Java, Python, C++, Go, TypeScript)
- Data structure implementation, basic algorithm development, and object-oriented design principles
- Bachelor's degree in CS, CE, Data Science, or related STEM field

Preferred Qualifications:
- Previous technical internship or project experience
- Cloud platforms (preferably AWS), Docker, Kubernetes, CI/CD pipelines
- SQL and NoSQL database systems
- Version control systems (Git/GitHub) and debugging complex systems`
  },
  {
    id: "backend-dev",
    label: "Backend Engineer (Cloud & Python)",
    title: "Backend Software Engineer",
    description: `Backend Software Engineer.
Requirements:
- 0-2 years experience in Python, FastAPI, Django, or Node.js.
- Strong knowledge of REST APIs, PostgreSQL / MySQL, Redis caching.
- Familiarity with Docker containerization and AWS (EC2, S3).
- Good understanding of Git, unit testing, and microservices architecture.`
  },
  {
    id: "frontend-dev",
    label: "Frontend React Developer",
    title: "Frontend Software Engineer (React / TypeScript)",
    description: `Frontend Software Engineer.
Requirements:
- Strong proficiency in JavaScript, TypeScript, React.js, and modern CSS/HTML.
- State management with Redux Toolkit, Context API, or Zustand.
- Experience with responsive design, component architecture, and REST API integration.
- Understanding of web performance, browser debugging, and Git version control.`
  }
];

export default function SingleResumeAnalyzer({ onCandidateAdded, onNavigateToLeaderboard }) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [candidateName, setCandidateName] = useState('');
  
  // Job Description state
  const [selectedJobPreset, setSelectedJobPreset] = useState('amazon-sde1');
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [customJobText, setCustomJobText] = useState('');

  // Execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileInputRef = useRef(null);

  const analysisSteps = [
    "Reading resume document and extracting raw text...",
    "Sending content to Groq LLM (openai/gpt-oss-120b)...",
    "Extracting structured schema (education, skills, experience, projects)...",
    "Comparing against target job specifications & scoring fit...",
    "Generating recruiter verdict & actionable recommendations..."
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setErrorMessage("Please upload a .pdf or .docx document.");
      return;
    }
    setSelectedFile(file);
    const inferredName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setCandidateName(inferredName);
  };

  const getTargetJobText = () => {
    if (isCustomJob) {
      return customJobText.trim();
    }
    const preset = JOB_PRESETS.find(p => p.id === selectedJobPreset);
    return preset ? preset.description : "";
  };

  const handleAnalyze = async () => {
    setErrorMessage(null);
    setAnalysisResult(null);

    if (inputMode === 'upload' && !selectedFile) {
      setErrorMessage("Please select or drop a .pdf / .docx resume file first.");
      return;
    }
    if (inputMode === 'text' && !resumeText.trim()) {
      setErrorMessage("Please paste resume text into the box.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => Math.min(prev + 1, analysisSteps.length - 1));
    }, 800);

    try {
      const formData = new FormData();
      if (inputMode === 'upload' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('resume_text', resumeText);
      }

      if (candidateName.trim()) {
        formData.append('candidate_name', candidateName.trim());
      }

      const activeJob = getTargetJobText();
      if (isCustomJob && activeJob) {
        formData.append('custom_job_description', activeJob);
      }
      formData.append('save_to_cohort', 'true');

      const res = await fetch('/api/analyze-single-resume', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error ${res.status}`);
      }

      const data = await res.json();
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setAnalysisResult(data);

      if (onCandidateAdded) {
        onCandidateAdded(data.candidate);
      }

    } catch (err) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMessage(err.message || "Analysis failed. Ensure Groq API key is valid.");
    }
  };

  const handleResetForm = () => {
    setSelectedFile(null);
    setResumeText('');
    setCandidateName('');
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleExportJson = () => {
    if (!analysisResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisResult, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${(candidateName || 'candidate').replace(/\s+/g, '_')}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Helper for gauge colors
  const getScoreColor = (sc) => {
    if (sc >= 70) return '#10b981';
    if (sc >= 60) return '#6366f1';
    if (sc >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  return (
    <div className="single-analyzer-container">
      {/* Studio Header Banner */}
      <div className="studio-hero-banner glass-panel">
        <div className="studio-hero-content">
          <span className="pill pill-cyan">
            <Sparkles size={13} /> Dedicated AI Screening Laboratory
          </span>
          <h2 className="studio-title">
            Upload & Analyze <span className="text-gradient">Individual Resume</span>
          </h2>
          <p className="studio-subtitle">
            Instantly parse candidate skills, evaluate experience qualification, and score compatibility against any target job description using Groq LLMs.
          </p>
        </div>
      </div>

      {/* Main Dual Grid: Form on Left / Results on Right */}
      <div className="studio-grid">
        {/* LEFT COLUMN: UPLOAD & CONFIGURATION */}
        <div className="studio-config-column">
          <div className="glass-panel studio-card">
            <div className="studio-card-header">
              <span className="step-badge">Step 1</span>
              <h3 className="card-heading">Select Resume Document</h3>
            </div>

            {/* Input Mode Selector */}
            <div className="input-toggle-pills">
              <button 
                className={`toggle-pill ${inputMode === 'upload' ? 'active' : ''}`}
                onClick={() => setInputMode('upload')}
                disabled={isAnalyzing}
              >
                <UploadCloud size={14} />
                <span>Upload PDF / DOCX</span>
              </button>
              <button 
                className={`toggle-pill ${inputMode === 'text' ? 'active' : ''}`}
                onClick={() => setInputMode('text')}
                disabled={isAnalyzing}
              >
                <FileType size={14} />
                <span>Paste Text</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="error-banner animate-fade-in mt-3">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* MODE: FILE UPLOAD */}
            {inputMode === 'upload' ? (
              <div className="upload-section mt-3">
                <div 
                  className={`dropzone-box ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf,.docx" 
                    style={{ display: 'none' }}
                  />

                  {selectedFile ? (
                    <div className="selected-file-display">
                      <div className="file-icon-wrap">
                        <FileCheck size={28} className="text-emerald" />
                      </div>
                      <div className="file-details">
                        <strong className="file-name">{selectedFile.name}</strong>
                        <span className="file-size text-muted">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Ready to analyze
                        </span>
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-empty-state">
                      <div className="dropzone-icon-circle">
                        <UploadCloud size={32} />
                      </div>
                      <h4 className="dropzone-title">Click to upload or drag & drop resume</h4>
                      <p className="dropzone-sub">Supports .pdf and .docx documents (max 15MB)</p>
                      <span className="pill pill-neutral mt-2">Auto-extracts text & formatting</span>
                    </div>
                  )}
                </div>

                {/* Candidate Name Input */}
                <div className="form-group mt-3">
                  <label className="input-label">Candidate Name (Optional / Auto-detected):</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Ashish Raj"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
            ) : (
              /* MODE: TEXT PASTE */
              <div className="text-section mt-3">
                <div className="form-group">
                  <label className="input-label">Candidate Name:</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Candidate Name"
                    disabled={isAnalyzing}
                  />
                </div>
                <div className="form-group mt-2">
                  <label className="input-label">Resume Text:</label>
                  <textarea 
                    className="resume-textarea" 
                    rows="8"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume content here..."
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: TARGET JOB SPECIFICATION */}
          <div className="glass-panel studio-card mt-3">
            <div className="studio-card-header">
              <span className="step-badge">Step 2</span>
              <h3 className="card-heading">Target Role Specification</h3>
            </div>

            <div className="job-preset-options mt-2">
              <div className="preset-buttons-row">
                {JOB_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`job-preset-btn ${selectedJobPreset === preset.id && !isCustomJob ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedJobPreset(preset.id);
                      setIsCustomJob(false);
                    }}
                    disabled={isAnalyzing}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  className={`job-preset-btn ${isCustomJob ? 'active' : ''}`}
                  onClick={() => setIsCustomJob(true)}
                  disabled={isAnalyzing}
                >
                  Custom Role Specification
                </button>
              </div>

              {isCustomJob ? (
                <div className="form-group mt-3">
                  <label className="input-label">Custom Job Description Text:</label>
                  <textarea 
                    className="resume-textarea" 
                    rows="5"
                    value={customJobText}
                    onChange={(e) => setCustomJobText(e.target.value)}
                    placeholder="Paste custom requirements, skills, and qualifications..."
                    disabled={isAnalyzing}
                  />
                </div>
              ) : (
                <div className="active-preset-preview mt-2">
                  <span className="preset-target-title">
                    <Building2 size={13} className="text-cyan" /> 
                    {JOB_PRESETS.find(p => p.id === selectedJobPreset)?.title}
                  </span>
                  <p className="preset-target-sub text-muted">
                    Evaluates DSA, cloud architectures (AWS), OOP principles, and systems experience.
                  </p>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="studio-action-row mt-4">
              <button 
                className="btn btn-primary btn-full btn-lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                id="start-analysis-btn"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="spinner-icon" />
                    <span>Evaluating with Groq LLM...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Run AI Resume Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* PROGRESS VISUALIZER */}
            {isAnalyzing && (
              <div className="analysis-progress-panel glass-panel animate-fade-in mt-3">
                <div className="analyzing-spinner-row">
                  <Loader2 size={18} className="spinner-icon text-indigo-400" />
                  <strong className="analyzing-title">Pipeline Running...</strong>
                </div>
                <p className="analyzing-step-text text-secondary">
                  {analysisSteps[analysisStep]}
                </p>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED REPORT DISPLAY */}
        <div className="studio-report-column">
          {analysisResult ? (
            /* COMPLETED ANALYSIS REPORT */
            <div className="report-container animate-fade-in">
              {/* Report Header Card */}
              <div className="glass-panel report-header-card">
                <div className="report-header-top">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="pill pill-emerald">Analysis Complete</span>
                      <span className="pill pill-neutral">{analysisResult.candidate.fileSource}</span>
                    </div>
                    <h3 className="report-candidate-name">{analysisResult.candidate.name}</h3>
                    <p className="report-candidate-role">
                      Target Role: <strong>{analysisResult.target_role || "Amazon SDE-I"}</strong>
                    </p>
                  </div>

                  {/* Circular Score Gauge */}
                  <div className="score-gauge-wrap" title={`Match Score: ${analysisResult.score}%`}>
                    <svg className="score-svg" width="94" height="94" viewBox="0 0 94 94">
                      <circle
                        cx="47"
                        cy="47"
                        r="38"
                        fill="transparent"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="7"
                      />
                      <circle
                        cx="47"
                        cy="47"
                        r="38"
                        fill="transparent"
                        stroke={getScoreColor(analysisResult.score)}
                        strokeWidth="7"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={(2 * Math.PI * 38) - (analysisResult.score / 100) * (2 * Math.PI * 38)}
                        strokeLinecap="round"
                        className="progress-circle"
                      />
                    </svg>
                    <div className="gauge-label-inside">
                      <span className="score-val" style={{ color: getScoreColor(analysisResult.score) }}>
                        {analysisResult.score}
                      </span>
                      <span className="score-percent">%</span>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="report-metrics-bar">
                  <div className="metric-chip">
                    <span className="chip-label">Experience Status:</span>
                    <span className="chip-val text-emerald">
                      <CheckCircle2 size={14} /> {analysisResult.experience_met ? "Qualified" : "Gap"}
                    </span>
                  </div>
                  <div className="metric-chip">
                    <span className="chip-label">Skills Matched:</span>
                    <span className="chip-val text-emerald">
                      {analysisResult.matching_skills.length} Competencies
                    </span>
                  </div>
                  <div className="metric-chip">
                    <span className="chip-label">Missing Gaps:</span>
                    <span className="chip-val text-rose">
                      {analysisResult.missing_skills.length} Areas
                    </span>
                  </div>
                </div>

                {/* Recruiter Verdict Callout */}
                <div className="verdict-callout mt-3">
                  <div className="verdict-icon-row">
                    <Sparkles size={15} className="verdict-sparkle" />
                    <span className="verdict-heading">AI Recruiter Assessment</span>
                  </div>
                  <p className="verdict-text">"{analysisResult.verdict}"</p>
                </div>
              </div>

              {/* Skills Dual Grid */}
              <div className="skills-dual-column mt-3">
                {/* Matching Skills */}
                <div className="skills-column column-match glass-panel">
                  <div className="col-header text-emerald">
                    <CheckCircle2 size={18} />
                    <h4>Matching Skills ({analysisResult.matching_skills.length})</h4>
                  </div>
                  <p className="col-sub">Identified competencies satisfying role requirements</p>
                  <div className="tags-container">
                    {analysisResult.matching_skills.map((sk, idx) => (
                      <span key={idx} className="pill pill-emerald skill-tag-lg">
                        <CheckCircle2 size={12} /> {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="skills-column column-missing glass-panel">
                  <div className="col-header text-rose">
                    <AlertCircle size={18} />
                    <h4>Growth / Missing Areas ({analysisResult.missing_skills.length})</h4>
                  </div>
                  <p className="col-sub">Recommended skills to strengthen qualification</p>
                  <div className="tags-container">
                    {analysisResult.missing_skills.map((sk, idx) => (
                      <span key={idx} className="pill pill-rose skill-tag-lg">
                        <AlertCircle size={12} /> {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extracted Profile Details */}
              <div className="glass-panel profile-extract-card mt-3">
                <h4 className="section-title">
                  <GraduationCap size={16} /> Extracted Education & Credentials
                </h4>
                <div className="education-list mt-2">
                  {analysisResult.candidate.education && analysisResult.candidate.education.map((edu, idx) => (
                    <div key={idx} className="education-item pill-neutral">
                      {edu}
                    </div>
                  ))}
                </div>

                {analysisResult.candidate.experiences && analysisResult.candidate.experiences.length > 0 && (
                  <div className="mt-3">
                    <h4 className="section-title">
                      <Briefcase size={16} /> Work Experiences & Internships
                    </h4>
                    <div className="timeline-list mt-2">
                      {analysisResult.candidate.experiences.map((exp, idx) => (
                        <div key={idx} className="timeline-item glass-panel">
                          <div className="timeline-title-row">
                            <strong className="timeline-role">{exp.role || "Software Intern"}</strong>
                            {exp.duration && <span className="pill pill-neutral">{exp.duration}</span>}
                          </div>
                          {exp.company && <div className="timeline-company text-indigo-300">{exp.company}</div>}
                          {exp.description && <p className="timeline-desc">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Report Action Buttons */}
              <div className="report-action-footer mt-3">
                <button 
                  className="btn btn-primary"
                  onClick={onNavigateToLeaderboard}
                >
                  <span>View on Main Leaderboard</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  className="btn btn-secondary"
                  onClick={handleExportJson}
                >
                  <Download size={16} />
                  <span>Download Analysis (JSON)</span>
                </button>

                <button 
                  className="btn btn-outline"
                  onClick={handleResetForm}
                >
                  <RotateCcw size={16} />
                  <span>Analyze Another Resume</span>
                </button>
              </div>
            </div>
          ) : (
            /* EMPTY STATE: READY TO ANALYZE */
            <div className="glass-panel studio-empty-state">
              <div className="studio-empty-icon-wrap">
                <ShieldCheck size={44} className="text-indigo-400" />
              </div>
              <h3 className="empty-title">Ready for Intelligent Resume Analysis</h3>
              <p className="empty-desc">
                Upload a candidate's resume on the left or paste plain text. The Groq reasoning engine will automatically parse their credentials, compare them against role requirements, and display the scorecard here.
              </p>

              <div className="quick-test-section mt-4">
                <span className="quick-test-heading">Or Try Quick Sample Resumes:</span>
                <div className="quick-test-buttons">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setInputMode('text');
                      setCandidateName("Ashish Raj");
                      setResumeText(`Ashish Raj\nMaster of Computer Applications (MCA) 2024-2026\nSkills: C++, Python, Data Structures, Algorithms, AWS, Docker, Kubernetes, Jenkins, Ansible, CI/CD\nExperience: Cloud Intern at TechSolutions (6 months) automating microservices on AWS.`);
                    }}
                  >
                    Load Sample: Ashish Raj (DevOps & AWS)
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setInputMode('text');
                      setCandidateName("Priyanshu Singh");
                      setResumeText(`Priyanshu Singh\nB.Tech Computer Science 2021-2025\nSkills: Java, SQL, MySQL, MongoDB, React.js, Node.js, Express.js, Redux Toolkit, Git\nProjects: Built full stack e-commerce web portal with React and Node.js.`);
                    }}
                  >
                    Load Sample: Priyanshu Singh (Web Developer)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
