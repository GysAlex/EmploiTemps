import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatImageUrl } from '../utils/imageUtils'; // Assure-toi que le chemin est correct

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fonction pour charger les données de l'utilisateur au démarrage ou après login/refresh
    const fetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
            await axios.get('/sanctum/csrf-cookie'); // Obtient le cookie CSRF
            const response = await axios.get('/api/user', {
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.data) {
                // S'assure que 'roles' est un tableau avant de mapper
                const userRoles = Array.isArray(response.data.roles) 
                    ? response.data.roles.map((role) => role.name)
                    : []; // Définit un tableau vide si ce n'est pas un tableau

                const userData = {
                    ...response.data,
                    profile_image: formatImageUrl(response.data.profile_image),
                    roles: userRoles // Utilise les rôles formatés
                };
                setUser(userData);
                // console.log("Données utilisateur récupérées :", userData); // À commenter/supprimer en production
            } else {
                setUser(null);
                // console.log("Aucune donnée utilisateur reçue, peut-être non authentifié."); // À commenter/supprimer en production
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des données utilisateur:", err);
            setError("Impossible de charger les informations utilisateur. Veuillez réessayer.");
            toast.error("Échec du chargement du profil utilisateur. Veuillez rafraîchir la page.");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // --- Fonction pour mettre à jour les informations de l'utilisateur (incluant les rôles) ---
    const updateUser = async (userId, updatedData) => {
        if (!userId) {
            toast.error("ID utilisateur manquant pour la mise à jour.");
            return null;
        }

        // Crée une promesse pour l'appel API qui sera gérée par toast.promise
        const updatePromise = axios.put(`/api/user/${userId}`, updatedData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json', // Assure le bon type de contenu
            },
        });

        toast.promise(updatePromise, {
            loading: 'Mise à jour du profil...',
            success: (response) => {
                // Met à jour l'état du user dans le contexte avec les nouvelles données
                // Assure-toi que ton backend renvoie l'objet utilisateur mis à jour
                // Inclure la logique de formatage si l'image ou les rôles sont renvoyés différemment
                const updatedUserFromServer = response.data;
                const formattedUpdatedUser = {
                    ...updatedUserFromServer,
                    profile_image: formatImageUrl(updatedUserFromServer.profile_image),
                    roles: Array.isArray(updatedUserFromServer.roles)
                        ? updatedUserFromServer.roles.map((role) => role.name)
                        : updatedUserFromServer.roles // Gère le cas où les rôles sont déjà formatés ou non un tableau d'objets
                };
                setUser(formattedUpdatedUser);
                return 'Profil mis à jour avec succès !';
            },
            error: (err) => {
                const errorMessage = err.response?.data?.message || 'Échec de la mise à jour du profil.';
                console.error("Erreur lors de la mise à jour du profil (API) :", err);
                return errorMessage;
            },
        });

        try {
            const response = await updatePromise;
            return response.data; // Retourne les données mises à jour
        } catch (err) {
            // L'erreur est déjà gérée par toast.promise, on la propage juste si d'autres logiques l'attendent
            throw err;
        }
    };
    // --- Fin de la fonction updateUser ---

    // La fonction updateProfileImage reste inchangée et est correcte.
    const updateProfileImage = async (imageFile) => {
        if (!imageFile) {
            toast.warning("Veuillez sélectionner un fichier image.");
            return null;
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                const formData = new FormData();
                formData.append('profile_image', imageFile);

                const response = await axios.post('/api/user/profile-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    },
                });

                const newImageUrl = formatImageUrl(response.data.profile_image_url);
                // Met à jour l'utilisateur localement dans le contexte
                setUser(prevUser => ({
                    ...prevUser,
                    profile_image: newImageUrl
                }));

                resolve(newImageUrl);
            } catch (err) {
                console.error("Erreur lors de l'upload de la photo de profil:", err);
                reject(err);
            }
        });

        toast.promise(promise, {
            loading: 'Mise à jour de la photo de profil...',
            success: (data) => {
                return 'Photo de profil mise à jour avec succès !';
            },
            error: (err) => {
                const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.';
                return errorMessage;
            },
            duration: 3000,
        });

        return promise;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const contextValue = {
        user,
        loading,
        error,
        fetchUser, // Permet de rafraîchir l'utilisateur manuellement si nécessaire
        updateUser, // Maintenant gère l'API call et la mise à jour du contexte
        updateProfileImage,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};