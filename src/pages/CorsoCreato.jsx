import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function CorsoCreato() {
    const { courseId } = useParams(); // Ottieni l'ID del corso dai parametri URL
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`http://localhost/progetto-1/backend/api/visualizzaCorso.php?courseId=${courseId}`);
                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setCourse(data.course); // Imposta i dettagli del corso
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    if (loading) {
        return <p>Caricamento in corso...</p>;
    }

    if (error) {
        return <p>Errore: {error}</p>;
    }

    return (
        <div>
            <h1>Corso ID: {courseId}</h1>
            <h2>{course.fullname}</h2>
            <p>{course.summary}</p>
            <h3>Sezioni</h3>
            {course.sections && Array.isArray(course.sections) && course.sections.map((section, index) => (
                <div key={index}>
                    <h4>{section.name}</h4>
                    <ul>
                        {section.modules && Array.isArray(section.modules) && section.modules.map((module, idx) => (
                            <li key={idx}>
                                <a href={module.url} target="_blank" rel="noopener noreferrer">
                                    {module.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default CorsoCreato;