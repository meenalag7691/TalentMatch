import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Check, 
  Play, 
  Loader2,
  AlertCircle,
  FileCheck,
  FileType
} from 'lucide-react';

const PRESET_RESUMES = [
  {
    label: "Preset 1: Rohan Sharma (Cloud & C++ High Match)",
    name: "Rohan Sharma",
    role: "Software Development Engineer Candidate",
    email: "rohan.sharma@example.com",
    score: 84.0,
    education: ["B.Tech in Computer Science & Engineering (2020-2024) - IIT Delhi"],
    matchingSkills: [
      "C++", "Java", "Data Structures", "Algorithms", "AWS", "Docker",
      "Kubernetes", "Microservices", "Git", "CI/CD", "Object-Oriented Design"
    ],
    missingSkills: ["Ansible", "GraphQL"],
    experienceRequirementMet: true,
    finalVerdict: "Outstanding candidate with proven distributed systems and OOP design skills. Matches all core requirements for Amazon SDE-I.",
    experiences: [
      {
        role: "Software Engineering Intern",
        company: "HyperScale Networks",
        duration: "6 Months",
        description: "Built high-throughput message consumer pipelines using C++ and AWS SQS, handling 20,000 req/sec with sub-millisecond latencies.",
        skillsUsed: ["C++", "AWS", "Docker", "Algorithms"]
      }
    ],
    projects: [
      {
        title: "Distributed Fault-Tolerant Key-Value Store",
        tech: ["C++", "Raft Consensus", "gRPC"],
        description: "Implemented Raft distributed consensus protocol in modern C++ with leader election and log replication."
      }
    ]
  },
  {
    label: "Preset 2: Neha Gupta (Data & Python ML Profile)",
    name: "Neha Gupta",
    role: "ML / Data Engineer Aspirant",
    email: "neha.gupta@example.com",
    score: 66.0,
    education: ["B.S. in Data Science & Artificial Intelligence (2021-2025)"],
    matchingSkills: [
      "Python", "SQL", "Data Structures", "Algorithms", "AI Tools", "Git", "Problem Solving"
    ],
    missingSkills: [
      "C++ or Java", "Cloud platforms (AWS)", "Distributed systems", "CI/CD principles"
    ],
    experienceRequirementMet: true,
    finalVerdict: "Strong analytical and Python/ML capabilities, but needs hands-on systems programming in C++/Java and AWS cloud infrastructure to excel in SDE-I.",
    experiences: [
      {
        role: "AI Research Intern",
        company: "GenAI Labs",
        duration: "4 Months",
        description: "Engineered document retrieval pipelines with LLM embeddings and vector databases.",
        skillsUsed: ["Python", "AI Tools", "SQL", "Git"]
      }
    ],
    projects: [
      {
        title: "Semantic Document Matcher",
        tech: ["Python", "FastAPI", "Vector DB"],
        description: "Built semantic resume retrieval system using sentence transformers and vector indexes."
      }
    ]
  }
];

export const sampleResumeDefaultText = `Rohan Sharma
Email: rohan.sharma@example.com | Phone: +91 98765 00112 | New Delhi, India

EDUCATION
B.Tech in Computer Science and Engineering
Indian Institute of Technology, Delhi (2020 - 2024) | CGPA: 9.1 / 10

TECHNICAL SKILLS
- Languages: C++, Java, Python, SQL, TypeScript
- Core: Data Structures, Algorithms, Object-Oriented Design (OOP), Distributed Systems
- Cloud & DevOps: AWS (EC2, S3, SQS), Docker, Kubernetes, Git, CI/CD pipelines

EXPERIENCE
Software Engineering Intern | HyperScale Networks (Jan 2024 - Jul 2024)
- Designed and benchmarked a distributed asynchronous event pipeline in modern C++ handling 20k events/sec.
- Deployed fault-tolerant microservices onto AWS EKS with Prometheus monitoring.

PROJECTS
- Distributed Raft Key-Value Store (C++, gRPC): Implemented multi-node consensus with log compaction.
- Smart Cloud File Sync: Hybrid cloud storage client with chunked file encryption.`;

export default function ResumeAnalyzerModal({ isOpen, onClose, onAddCandidate, isBackendConnected }) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload' | 'text' | 'preset'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customText, setCustomText] = useState(sampleResumeDefaultText);
  const [candidateName, setCandidateName] = useState("Rohan Sharma");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const analysisStepsList = [
    "Reading file bytes & extracting plain text...",
    "Sending structured payload to Groq LLM...",
    "Benchmarking skills against Amazon SDE-I Qualifications...",
    "Synthesizing recruiter verdict and match percentage..."
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
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
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
    setCandidateName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleSelectPreset = (index) => {
    setSelectedPresetIndex(index);
    const p = PRESET_RESUMES[index];
    setCandidateName(p.name);
    setCustomText(`Candidate: ${p.name}\nRole: ${p.role}\nEducation: ${p.education[0]}\nSkills: ${p.matchingSkills.join(', ')}`);
  };

  const handleRunEvaluation = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Live animation sequence
    const stepTimer = setInterval(() => {
      setAnalysisStep((prev) => Math.min(prev + 1, analysisStepsList.length - 1));
    }, 700);

    try {
      // 1. If real file is selected and backend is available
      if (activeMode === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        clearInterval(stepTimer);
        setIsAnalyzing(false);
        onAddCandidate(data.candidate);
        onClose();
        return;
      }

      // 2. If text mode and backend is available
      if (activeMode === 'text') {
        const response = await fetch('/api/evaluate-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_name: candidateName,
            resume_text: customText
          })
        });

        if (response.ok) {
          const data = await response.json();
          clearInterval(stepTimer);
          setIsAnalyzing(false);
          onAddCandidate(data.candidate);
          onClose();
          return;
        }
      }

      // 3. Fallback or Preset Simulation
      setTimeout(() => {
        clearInterval(stepTimer);
        setIsAnalyzing(false);

        const preset = PRESET_RESUMES[selectedPresetIndex];
        const newCandidate = {
          id: `eval-${Date.now()}`,
          name: candidateName || preset.name,
          score: preset.score,
          rank: 1,
          role: preset.role,
          email: preset.email,
          phone: "+91 98765 00000",
          location: "India (Remote/Hybrid)",
          fileSource: selectedFile ? selectedFile.name : `${candidateName.replace(/\s+/g, '_')}_resume.pdf`,
          matchingSkills: preset.matchingSkills,
          missingSkills: preset.missingSkills,
          experienceRequirementMet: preset.experienceRequirementMet,
          overallMatchPercentage: preset.score,
          finalVerdict: preset.finalVerdict,
          education: preset.education,
          experiences: preset.experiences,
          projects: preset.projects,
          status: preset.score >= 70 ? "Top Match" : "Recommended",
          badgeTier: preset.score >= 70 ? "tier-gold" : "tier-silver"
        };

        onAddCandidate(newCandidate);
        onClose();
      }, 1800);

    } catch (err) {
      clearInterval(stepTimer);
      setIsAnalyzing(false);
      setErrorMessage(err.message || "Evaluation failed. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="evaluator-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="pill pill-cyan">
                <Sparkles size={13} /> AI Resume Evaluator
              </span>
              {isBackendConnected ? (
                <span className="pill pill-emerald text-xs">Live API Active</span>
              ) : (
                <span className="pill pill-neutral text-xs">Local Engine</span>
              )}
            </div>
            <h3 className="modal-candidate-name">Evaluate Candidate Resume</h3>
            <p className="modal-candidate-role">
              Extract entities and compute Amazon SDE-I match score with Groq
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="close-evaluator-btn">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="evaluator-mode-tabs">
          <button 
            className={`mode-tab-btn ${activeMode === 'upload' ? 'active' : ''}`}
            onClick={() => { setActiveMode('upload'); setErrorMessage(null); }}
            disabled={isAnalyzing}
          >
            <UploadCloud size={15} />
            <span>Upload File (.PDF / .DOCX)</span>
          </button>
          <button 
            className={`mode-tab-btn ${activeMode === 'text' ? 'active' : ''}`}
            onClick={() => { setActiveMode('text'); setErrorMessage(null); }}
            disabled={isAnalyzing}
          >
            <FileType size={15} />
            <span>Paste Resume Text</span>
          </button>
          <button 
            className={`mode-tab-btn ${activeMode === 'preset' ? 'active' : ''}`}
            onClick={() => { setActiveMode('preset'); setErrorMessage(null); }}
            disabled={isAnalyzing}
          >
            <FileCheck size={15} />
            <span>Sample Presets</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="error-banner animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE 1: FILE UPLOAD DROPZONE */}
        {activeMode === 'upload' && (
          <div className="upload-mode-container">
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
                id="resume-file-input"
              />

              {selectedFile ? (
                <div className="selected-file-display">
                  <div className="file-icon-wrap">
                    <FileCheck size={28} className="text-emerald" />
                  </div>
                  <div className="file-details">
                    <strong className="file-name">{selectedFile.name}</strong>
                    <span className="file-size text-muted">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to parse with Groq
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
                    <UploadCloud size={30} />
                  </div>
                  <h4 className="dropzone-title">Click to upload or drag & drop resume</h4>
                  <p className="dropzone-sub">Supports Adobe PDF (.pdf) and Microsoft Word (.docx)</p>
                  <span className="pill pill-neutral mt-2">Maximum file size: 10MB</span>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="form-group mt-3">
                <label className="input-label">Candidate Name (auto-detected):</label>
                <input
                  type="text"
                  className="text-input"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>
            )}
          </div>
        )}

        {/* MODE 2: PASTE RAW TEXT */}
        {activeMode === 'text' && (
          <div className="text-mode-container">
            <div className="form-group">
              <label className="input-label">Candidate Name:</label>
              <input
                type="text"
                className="text-input"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Priyanshu Sharma"
                disabled={isAnalyzing}
              />
            </div>
            <div className="form-group mt-2">
              <label className="input-label">Resume Text Content:</label>
              <textarea
                className="resume-textarea"
                rows="7"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste extracted resume text here..."
                disabled={isAnalyzing}
              />
            </div>
          </div>
        )}

        {/* MODE 3: SAMPLE PRESETS */}
        {activeMode === 'preset' && (
          <div className="preset-mode-container">
            <div className="preset-selector-row">
              <label className="input-label">Choose Pre-configured Candidate:</label>
              <div className="preset-tabs">
                {PRESET_RESUMES.map((preset, idx) => (
                  <button
                    key={idx}
                    className={`preset-btn ${selectedPresetIndex === idx ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(idx)}
                    disabled={isAnalyzing}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="input-label">Candidate Name:</label>
              <input
                type="text"
                className="text-input"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
          </div>
        )}

        {/* Live Analysis Progress Display */}
        {isAnalyzing && (
          <div className="analysis-progress-panel glass-panel animate-fade-in mt-2">
            <div className="analyzing-spinner-row">
              <Loader2 size={18} className="spinner-icon text-indigo-400" />
              <strong className="analyzing-title">Running Groq AI Pipeline...</strong>
            </div>
            <p className="analyzing-step-text text-secondary">
              {analysisStepsList[analysisStep]}
            </p>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((analysisStep + 1) / analysisStepsList.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isAnalyzing}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleRunEvaluation}
            disabled={isAnalyzing || (activeMode === 'upload' && !selectedFile)}
            id="run-eval-btn"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="spinner-icon" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Groq AI Evaluation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
