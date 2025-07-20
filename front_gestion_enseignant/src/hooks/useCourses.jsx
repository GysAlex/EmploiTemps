import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Utilisez axios directement, comme dans votre exemple
import { toast } from 'sonner'; // Pour les notifications sonner

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

// 1. Créez votre Contexte
const CourseContext = createContext();

// 2. Créez votre Provider (le composant qui fournira le contexte)
export function CourseProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Stabilisez fetchCourses avec useCallback
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            // Adaptez l'URL de l'API pour les cours
            await axios.get('/sanctum/csrf-cookie'); // Obtention du cookie CSRF
            const response = await axios.get('/api/courses');
            
            setCourses(response.data);

        } catch (err) {
            console.error("Erreur lors de la récupération des cours (Contexte):", err);
            setError(err);
            toast.error("Erreur lors du chargement des cours.");
        } finally {
            setLoading(false);
        }
    } // Dépendances vides pour que fetchCourses soit stable

    useEffect(() => {
        fetchCourses();  
    }, []); 

    // Fonctions de modification qui déclenchent le re-fetch
    const createCourse = async (courseData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({});
        const createPromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie'); 
                const response = await axios.post('/api/courses', courseData); 
                await fetchCourses(); 
                resolve({ message: "Cours créé avec succès !", course: response.data.data });
            } catch (err) {
                console.error("Erreur lors de la création du cours (Contexte):", err);
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.errors) {
                    setValidationErrors(err.response.data.errors);
                    reject("Veuillez corriger les erreurs dans le formulaire.");
                } else {
                    reject("Échec de la création du cours.");
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        });
        toast.promise(createPromise, { loading: 'Création...', success: (data) => data.message, error: (message) => message });
        return createPromise;
    };

    const updateCourse = async (courseId, courseData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({});
        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie'); // Obtention du cookie CSRF
                const response = await axios.put(`/api/courses/${courseId}`, courseData); // Endpoint Laravel
                await fetchCourses(); // Re-fetch les cours après succès
                resolve({ message: "Cours mis à jour avec succès !", course: response.data.data });
            } catch (err) {
                console.error("Erreur lors de la mise à jour du cours (Contexte):", err);
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.errors) {
                    setValidationErrors(err.response.data.errors);
                    reject("Veuillez corriger les erreurs dans le formulaire.");
                } else {
                    reject("Échec de la mise à jour du cours.");
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        });
        toast.promise(updatePromise, { loading: 'Mise à jour...', success: (data) => data.message, error: (message) => message });
        return updatePromise;
    };

    const deleteCourse = async (courseId) => {
        setLoading(true);
        setError(null);
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie'); // Obtention du cookie CSRF
                await axios.delete(`/api/courses/${courseId}`); // Endpoint Laravel
                await fetchCourses(); // Re-fetch les cours après succès
                resolve("Cours supprimé avec succès !");
            } catch (err) {
                console.error("Erreur lors de la suppression du cours (Contexte):", err);
                reject("Échec de la suppression du cours.");
                setError(err);
            } finally {
                setLoading(false);
            }
        });
        toast.promise(deletePromise, { loading: 'Suppression...', success: (message) => message, error: (message) => message });
        return deletePromise;
    };

    // 3. Fournissez les valeurs via le Provider
    const contextValue = {
        courses,
        loading,
        error,
        validationErrors,
        fetchCourses, // Exposez si nécessaire
        createCourse,
        updateCourse,
        deleteCourse,
        setValidationErrors, // Pour permettre de vider les erreurs depuis le formulaire
    };

    return (
        <CourseContext.Provider value={contextValue}>
            {children}
        </CourseContext.Provider>
    );
}

// 4. Créez un hook personnalisé pour consommer le contexte
export function useCourses() {
    const context = useContext(CourseContext);
    if (context === undefined) {
        throw new Error('useCourses must be used within a CourseProvider');
    }
    return context;
}