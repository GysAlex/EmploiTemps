// src/context/ClassroomContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

const ClassroomContext = createContext();

// 2. Créez votre Provider (le composant qui fournira le contexte)
export function ClassroomProvider({ children }) {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Stabilisez fetchClassrooms avec useCallback
    const fetchClassrooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Adaptez l'URL de l'API pour les salles de classe
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.get('/api/classrooms');
            // Assurez-vous que la structure de la réponse de votre API correspond
            // Par exemple, si Laravel retourne { data: [...] }
            setClassrooms(response.data);
            console.log("Salles de classe récupérées dans le Contexte:", response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des salles de classe (Contexte):", err);
            setError(err);
            toast.error("Erreur lors du chargement des salles de classe.");
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides pour que fetchClassrooms soit stable

    // Chargement initial des salles de classe au montage du Provider
    // fetchClassrooms est stable grâce à useCallback

    // Fonctions de modification qui déclenchent le re-fetch
    const createClassroom = async (classroomData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({});
        const createPromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.post('/api/classrooms', classroomData); // Adaptez l'URL
                await fetchClassrooms(); // Re-fetch les salles de classe après succès
                resolve({ message: "Salle de classe créée avec succès !", classroom: response.data.data });
            } catch (err) {
                console.error("Erreur lors de la création de la salle de classe (Contexte):", err);
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.errors) {
                    setValidationErrors(err.response.data.errors);
                    reject("Veuillez corriger les erreurs dans le formulaire.");
                } else {
                    reject("Échec de la création de la salle de classe.");
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        });
        toast.promise(createPromise, { loading: 'Création...', success: (data) => data.message, error: (message) => message });
        return createPromise;
    };

    const updateClassroom = async (classroomId, classroomData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({});
        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.put(`/api/classrooms/${classroomId}`, classroomData); // Adaptez l'URL
                await fetchClassrooms(); // Re-fetch les salles de classe après succès
                resolve({ message: "Salle de classe mise à jour avec succès !", classroom: response.data.data });
            } catch (err) {
                console.error("Erreur lors de la mise à jour de la salle de classe (Contexte):", err);
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.errors) {
                    setValidationErrors(err.response.data.errors);
                    reject("Veuillez corriger les erreurs dans le formulaire.");
                } else {
                    reject("Échec de la mise à jour de la salle de classe.");
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        });
        toast.promise(updatePromise, { loading: 'Mise à jour...', success: (data) => data.message, error: (message) => message });
        return updatePromise;
    };

    const deleteClassroom = async (classroomId) => {
        setLoading(true);
        setError(null);
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie');
                await axios.delete(`/api/classrooms/${classroomId}`); // Adaptez l'URL
                await fetchClassrooms(); // Re-fetch les salles de classe après succès
                resolve("Salle de classe supprimée avec succès !");
            } catch (err) {
                console.error("Erreur lors de la suppression de la salle de classe (Contexte):", err);
                reject("Échec de la suppression de la salle de classe.");
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
        classrooms,
        loading,
        error,
        validationErrors,
        fetchClassrooms, // Exposez si nécessaire
        createClassroom,
        updateClassroom,
        deleteClassroom,
        setValidationErrors,
    };

    return (
        <ClassroomContext.Provider value={contextValue}>
            {children}
        </ClassroomContext.Provider>
    );
}

// 4. Créez un hook personnalisé pour consommer le contexte
export function useClassrooms() {
    const context = useContext(ClassroomContext);
    if (context === undefined) {
        throw new Error('useClassrooms must be used within a ClassroomProvider');
    }
    return context;
}