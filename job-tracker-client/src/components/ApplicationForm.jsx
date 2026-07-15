import { useState, useEffect } from 'react';
import { STATUS_OPTIONS } from '../constants';
import { useDuplicateCheck } from '../hooks/useDuplicateCheck';
import { formatStatus, isStale } from '../utils';
const EMPTY_FORM = {
    companyName: '', position: '', status: 'Pending',
    location: '', salaryMin: '', salaryMax: '',
    expirationDate: '', rawDescription: '', tagsString: '',
    appliedDate: '', notes: '',
};

export default function ApplicationForm({ initialData, onSubmit, onCancel, isEditMode }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!initialData) return;
        setFormData(prev => ({
            ...prev,
            companyName:    initialData.companyName    || prev.companyName,
            position:       initialData.position       || prev.position,
            status:         initialData.status         || prev.status,
            location:       initialData.location       || prev.location,
            salaryMin:      initialData.salaryMin      ?? prev.salaryMin,
            salaryMax:      initialData.salaryMax      ?? prev.salaryMax,
            rawDescription: initialData.rawDescription || prev.rawDescription,
            appliedDate:    initialData.appliedDate    || prev.appliedDate,
            notes:          initialData.notes          || prev.notes,
            expirationDate: initialData.expirationDate
                ? new Date(initialData.expirationDate).toISOString().split('T')[0]
                : prev.expirationDate,
            tagsString: initialData.tags?.length > 0
                ? initialData.tags.join(', ')
                : (initialData.tagsString || prev.tagsString),
        }));
    }, [initialData]);

    const { duplicate, isChecking } = useDuplicateCheck(formData.companyName, !isEditMode);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const parseTags = (str) =>
        str ? str.split(',').map(t => t.trim()).filter(Boolean) : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            companyName:    formData.companyName,
            position:       formData.position,
            status:         formData.status,
            appliedDate:    formData.appliedDate || new Date().toISOString(),
            location:       formData.location       || null,
            salaryMin:      formData.salaryMin      ? Number(formData.salaryMin) : null,
            salaryMax:      formData.salaryMax      ? Number(formData.salaryMax) : null,
            expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
            rawDescription: formData.rawDescription || null,
            tags:           parseTags(formData.tagsString),
            notes:          formData.notes          || null,
        };

        try {
            await onSubmit(payload);
            if (!isEditMode) setFormData(EMPTY_FORM);
        } catch {
            // ошибка обработана в родителе
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-col">
            <div className="form-group">
                <label>Company Name</label>
                <input
                    type="text" name="companyName"
                    placeholder="e.g. Google"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                />
                {!isEditMode && isChecking && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Checking...
                    </p>
                )}
                {!isEditMode && duplicate && (
                    <div className="alert alert-warning" style={{ marginTop: '6px' }}>
                        ⚠️ Already applied on{' '}
                        <strong>{new Date(duplicate.appliedDate).toLocaleDateString()}</strong>{' '}
                        for <strong>{duplicate.position}</strong>{' '}
                        — {formatStatus(duplicate.status)}
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Position</label>
                <input
                    type="text" name="position"
                    placeholder="e.g. Software Engineer"
                    value={formData.position}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{formatStatus(status)}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Location</label>
                <input
                    type="text" name="location"
                    placeholder="e.g. London, Remote"
                    value={formData.location}
                    onChange={handleChange}
                />
            </div>

            <div className="form-grid-2">
                <div className="form-group">
                    <label>Salary Min (£)</label>
                    <input type="number" name="salaryMin" placeholder="50000" value={formData.salaryMin} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Salary Max (£)</label>
                    <input type="number" name="salaryMax" placeholder="70000" value={formData.salaryMax} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group">
                <label>Application Deadline (optional, defaults to 30 days)</label>
                <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                    type="text" name="tagsString"
                    placeholder=".NET, Azure, React"
                    value={formData.tagsString}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Notes</label>
                <textarea
                    name="notes"
                    placeholder="Recruiter contact, interview details, next steps..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Add application'}
                </button>
                {isEditMode && onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}