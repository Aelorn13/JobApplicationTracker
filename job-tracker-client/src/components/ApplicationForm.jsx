import { useState, useEffect } from 'react';
import { STATUS_OPTIONS } from '../constants';

const EMPTY_FORM = {
    companyName: '',
    position: '',
    status: 'Pending',
    location: '',
    salaryMin: '',
    salaryMax: '',
    expirationDate: '',
    rawDescription: '',
    tagsString: '',
    appliedDate: '',
};

export default function ApplicationForm({ initialData, onSubmit, onCancel, isEditMode }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false); // фикс: блокировка кнопки

    useEffect(() => {
        if (!initialData) return;

        setFormData(prev => ({
            ...prev,
            companyName: initialData.companyName || prev.companyName,
            position: initialData.position || prev.position,
            status: initialData.status || prev.status,
            location: initialData.location || prev.location,
            salaryMin: initialData.salaryMin ?? prev.salaryMin,
            salaryMax: initialData.salaryMax ?? prev.salaryMax,
            expirationDate: initialData.expirationDate
                ? new Date(initialData.expirationDate).toISOString().split('T')[0]
                : prev.expirationDate,
            rawDescription: initialData.rawDescription || prev.rawDescription,
            appliedDate: initialData.appliedDate || prev.appliedDate,
            tagsString: initialData.tags?.length > 0
                ? initialData.tags.join(', ')
                : (initialData.tagsString || prev.tagsString),
        }));
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const parseTags = (str) => {
        if (!str) return [];
        return str.split(',').map(t => t.trim()).filter(Boolean);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            companyName: formData.companyName,
            position: formData.position,
            status: formData.status,
            appliedDate: formData.appliedDate || new Date().toISOString(),
            location: formData.location || null,
            salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
            salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
            expirationDate: formData.expirationDate
                ? new Date(formData.expirationDate).toISOString()
                : null,
            rawDescription: formData.rawDescription || null,
            tags: parseTags(formData.tagsString),
        };

        try {
            await onSubmit(payload);
            // фикс: сбрасываем форму только при успехе
            if (!isEditMode) {
                setFormData(EMPTY_FORM);
            }
        } catch {
            // ошибка уже обработана в родителе через setError
            // просто не сбрасываем форму — пользователь не теряет данные
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}>
            <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required />
            <input type="text" name="position" placeholder="Position" value={formData.position} onChange={handleChange} required />

            <select name="status" value={formData.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                        {status.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                ))}
            </select>

            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />

            <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{ flex: 1 }} type="number" name="salaryMin" placeholder="Salary Min (£)" value={formData.salaryMin} onChange={handleChange} />
                <input style={{ flex: 1 }} type="number" name="salaryMax" placeholder="Salary Max (£)" value={formData.salaryMax} onChange={handleChange} />
            </div>

            <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
            <input type="text" name="tagsString" placeholder="Tags (comma separated)" value={formData.tagsString} onChange={handleChange} />

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Save' : 'Submit')}
                </button>
                {isEditMode && onCancel && (
                    <button type="button" onClick={onCancel}>Cancel</button>
                )}
            </div>
        </form>
    );
}