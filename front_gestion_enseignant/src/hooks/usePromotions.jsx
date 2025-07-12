// src/context/PromotionContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner'; 

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

const PromotionContext = createContext();


// 2. Créez votre Provider (le composant qui fournira le contexte)
export function PromotionProvider({ children }) {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Stabilisez fetchPromotions avec useCallback
    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await axios.get(`http://localhost:8000/sanctum/csrf-cookie`); // Assurez-vous que le cookie CSRF est là
            const response = await axios.get(`http://localhost:8000/api/promotions`);
            // Assurez-vous que la structure de la réponse de votre API correspond.
            // Si Laravel retourne { data: [...] }, utilisez response.data.data
            setPromotions(response.data.data || response.data);
            console.log("Promotions récupérées dans le Contexte:", response.data.data || response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des promotions (Contexte):", err);
            setError(err);
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Erreur réseau ou serveur lors du chargement des promotions.");
            } else {
                toast.error("Une erreur inattendue est survenue lors du chargement des promotions.");
            }
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides pour que fetchPromotions soit stable

    // Chargement initial des promotions au montage du Provider
    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]); // fetchPromotions est stable grâce à useCallback

    // Fonctions de modification qui déclenchent le re-fetch
    const addPromotion = async (promotionData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({}); // Efface les erreurs de validation précédentes
        const createPromise = new Promise(async (resolve, reject) => {
            try {
                // Requête pour obtenir le cookie CSRF si votre backend l'exige (ex: Laravel Sanctum)
                await axios.get(`http://localhost:8000/sanctum/csrf-cookie`);
                const response = await axios.post(`http://localhost:8000/api/promotions`, promotionData);
                await fetchPromotions(); // Re-fetch les promotions après succès
                resolve("Promotion ajoutée avec succès !");
            } catch (err) {
                console.error("Erreur lors de l'ajout de la promotion (Contexte):", err);
                setError(err);
                if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 422 && err.response.data.errors) {
                        setValidationErrors(err.response.data.errors);
                        reject("Veuillez corriger les erreurs de validation.");
                    } else {
                        reject(err.response.data.message || "Échec de l'ajout de la promotion.");
                    }
                } else {
                    reject("Une erreur inattendue est survenue lors de l'ajout de la promotion.");
                }
            } finally {
                setLoading(false);
            }
        });
        toast.promise(createPromise, { loading: 'Ajout de la promotion...', success: (message) => message, error: (message) => message });
        return createPromise;
    };

    const updatePromotion = async (id, promotionData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({}); // Efface les erreurs de validation précédentes
        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get(`http://localhost:8000/sanctum/csrf-cookie`);
                const response = await axios.put(`http://localhost:8000/api/promotions/${id}`, promotionData);
                await fetchPromotions(); // Re-fetch les promotions après succès
                resolve("Promotion mise à jour avec succès !");
            } catch (err) {
                console.error("Erreur lors de la mise à jour de la promotion (Contexte):", err);
                setError(err);
                if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 422 && err.response.data.errors) {
                        setValidationErrors(err.response.data.errors);
                        reject("Veuillez corriger les erreurs de validation.");
                    } else {
                        reject(err.response.data.message || "Échec de la mise à jour de la promotion.");
                    }
                } else {
                    reject("Une erreur inattendue est survenue lors de la mise à jour de la promotion.");
                }
            } finally {
                setLoading(false);
            }
        });
        toast.promise(updatePromise, { loading: 'Mise à jour...', success: (message) => message, error: (message) => message });
        return updatePromise;
    };

    const deletePromotion = async (id) => {
        setLoading(true);
        setError(null);
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get(`http://localhost:8000/sanctum/csrf-cookie`);
                await axios.delete(`http://localhost:8000/api/promotions/${id}`);
                await fetchPromotions(); // Re-fetch les promotions après succès
                resolve("Promotion supprimée avec succès !");
            } catch (err) {
                console.error("Erreur lors de la suppression de la promotion (Contexte):", err);
                setError(err);
                if (axios.isAxiosError(err) && err.response) {
                    reject(err.response.data.message || "Échec de la suppression de la promotion.");
                } else {
                    reject("Une erreur inattendue est survenue lors de la suppression de la promotion.");
                }
            } finally {
                setLoading(false);
            }
        });
        toast.promise(deletePromise, { loading: 'Suppression...', success: (message) => message, error: (message) => message });
        return deletePromise;
    };

    // 3. Fournissez les valeurs via le Provider
    const contextValue = {
        promotions,
        loading,
        error,
        validationErrors,
        setValidationErrors, // Exposez cette fonction pour permettre à un formulaire de vider les erreurs
        fetchPromotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
    };

    return (
        <PromotionContext.Provider value={contextValue}>
            {children}
        </PromotionContext.Provider>
    );
}

export function usePromotions() {
    const context = useContext(PromotionContext);
    if (context === undefined) {
        throw new Error('usePromotions must be used within a PromotionProvider');
    }
    return context;
}