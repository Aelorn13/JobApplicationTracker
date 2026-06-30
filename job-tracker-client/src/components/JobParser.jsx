import { useState } from 'react';
import api from '../api/axios';

export default function JobParser({ onParsed }) {
    const [jobText, setJobText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');

    const handleParse = async () => {
        if (!jobText.trim()) return;

        setIsParsing(true);
        setParseError('');

        try {
            const response = await api.post('/JobApplications/parse', { jobText });
            onParsed({ ...response.data, rawDescription: jobText });
            setJobText('');
        } catch {
            setParseError('Failed to parse job description. Try again.');
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <section style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
            <h3>Parse from Job Description</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
                Paste the job posting text below and click Parse. Fields will be auto-filled.
            </p>
            <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste job description here..."
                rows={8}
                style={{ width: '100%', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            {parseError && <div style={{ color: 'red', marginBottom: '8px' }}>{parseError}</div>}
            <button onClick={handleParse} disabled={isParsing || !jobText.trim()}>
                {isParsing ? 'Parsing...' : 'Parse'}
            </button>
        </section>
    );
}