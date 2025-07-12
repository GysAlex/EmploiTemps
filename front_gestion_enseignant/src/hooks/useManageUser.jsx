// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// 1. Créez votre Contexte
const UserContext = createContext();

// Configuration Axios (assurez-vous que c'est fait une seule fois au niveau global)
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// 2. Créez votre Provider (le composant qui fournira le contexte)
export function UserProviderManagement({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Stabilisez fetchUsers avec useCallback
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des utilisateurs (Contexte):", err);
            setError(err);
            toast.error("Erreur lors du chargement des utilisateurs.");
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides pour que fetchUsers soit stable

    // Chargement initial des utilisateurs au montage du Provider



    // Fonctions de modification qui déclenchent le re-fetch
    // Fonction pour créer un utilisateur
    const createUser = async (userData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({}); // Réinitialiser les erreurs de validation
        const createPromise = new Promise(async (resolve, reject) => {
            try {
                // S'assurer que le cookie CSRF est là
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.post('/api/users/create', userData);
                await fetchUsers();
                // Si votre backend renvoie le nouvel utilisateur, vous pouvez le retourner
                resolve({ message: "Utilisateur créé avec succès !", user: response.data.data });

            } catch (err) {
                console.error("Erreur lors de la création de l'utilisateur:", err);
                if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.errors) {
                    // Erreurs de validation du backend (statut 422 Unprocessable Entity par exemple)
                    setValidationErrors(err.response.data.errors);
                    reject("Veuillez corriger les erreurs dans le formulaire.");
                } else {
                    // Autres types d'erreurs (réseau, serveur 5xx, etc.)
                    reject("Échec de la création de l'utilisateur.");
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        });

        toast.promise(createPromise, {
            loading: 'Création de l\'utilisateur...',
            success: (data) => data.message,
            error: (message) => message,
        });

        return createPromise; // Retourne la promesse pour pouvoir chaîner .then/.catch dans le composant appelant
    };

    // Fonction pour mettre à jour un utilisateur
    const updateUser = async (userId, userData) => {
        setLoading(true);
        setError(null);
        setValidationErrors({}); // Réinitialiser les erreurs de validation
        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                // S'assurer que le cookie CSRF est là
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.put(`/api/users/${userId}/update`, userData);
                await fetchUsers();
                resolve({ message: "Utilisateur mis à jour avec succès !", user: response.data.data });
            } catch (err) {
                console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
                 if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.errors) {
                    setValidationErrors(err.response.data.errors);
                    reject("Veuillez corriger les erreurs dans le formulaire.");
                } else {
                    reject("Échec de la mise à jour de l'utilisateur.");
                }
                setError(err);
            } finally {
                setLoading(false);
            }
        });

        toast.promise(updatePromise, {
            loading: 'Mise à jour de l\'utilisateur...',
            success: (data) => data.message,
            error: (message) => message,
        });

        return updatePromise;
    };

    // Fonction pour supprimer un utilisateur
    const deleteUser = async (userId) => {
        setLoading(true);
        setError(null);
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                await axios.get('/sanctum/csrf-cookie');
                await axios.delete(`/api/users/${userId}/delete`);
                await fetchUsers();
                resolve("Utilisateur supprimé avec succès !");
            } catch (err) {
                console.error("Erreur lors de la suppression de l'utilisateur:", err);
                reject("Échec de la suppression de l'utilisateur.");
                setError(err);
            } finally {
                setLoading(false);
            }
        });

        toast.promise(deletePromise, {
            loading: 'Suppression de l\'utilisateur...',
            success: (message) => message,
            error: (message) => message,
        });

        return deletePromise;
    };



    // 3. Fournissez les valeurs via le Provider
    const contextValue = {
        users,
        loading,
        error,
        validationErrors,
        fetchUsers, // Exposez fetchUsers si vous voulez le déclencher manuellement
        createUser,
        updateUser,
        deleteUser,
        setValidationErrors, // Pour réinitialiser/gérer les erreurs dans les formulaires
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

// 4. Créez un hook personnalisé pour consommer le contexte (plus propre)
export function useManageUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
}