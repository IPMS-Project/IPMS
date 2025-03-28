// src/SubmissionForm.js
import React, { useState } from 'react';

const SubmissionForm = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && details) {
            onSubmit({ name, details, status: 'Pending' });
            setName('');
            setDetails('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Submission Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <textarea
                placeholder="Submission Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default SubmissionForm;
