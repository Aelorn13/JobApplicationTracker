import { useState } from 'react';
import api from '../api/axios';

export default function JobParser({ onParsed }) {
    const [jobText, setJobText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleParse = async () => {
        if (!jobText.trim()) return;
        setIsParsing(true);
        setParseError('');
        try {
            const response = await api.post('/JobApplications/parse', { jobText });
            onParsed({ ...response.data, rawDescription: jobText });
            setJobText('');
            setIsOpen(false);
        } catch {
            setParseError('Failed to parse. Try again.');
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="card" style={{ marginBottom: '20px', overflow: 'hidden' }}>
            <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsOpen(prev => !prev)}
                style={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                }}
            >
                <span>✨ Parse from job description</span>
                <span style={{ fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div style={{ padding: '0 16px 16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Paste the job posting text — company, position, salary and tags will be filled automatically.
                    </p>
                    <textarea
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                        placeholder="Paste job description here..."
                        rows={6}
                        style={{ marginBottom: '10px' }}
                    />
                    {parseError && (
                        <p style={{ fontSize: '13px', color: '#DC2626', marginBottom: '8px' }}>{parseError}</p>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={handleParse}
                        disabled={isParsing || !jobText.trim()}
                    >
                        {isParsing ? 'Parsing...' : 'Parse'}
                    </button>
                </div>
            )}
        </div>
    );
}