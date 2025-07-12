// src/context/TimetableContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true


// 1. Créez votre Contexte
const TimetableContext = createContext();



// 2. Créez votre Provider
export function TimetableProviderManagement({ children }) {
    const [promotionsWithTimetableStatus, setPromotionsWithTimetableStatus] = useState({
        data: [],        // Les promotions paginées
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [currentWeekInfo, setCurrentWeekInfo] = useState(null); // Informations sur la semaine actuelle
    const [stats, setStats] = useState({  // Statistiques globales
        totalEmplois: 0,
        emploisDefinis: 0,
        promotionsSansEDT: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stabilisez fetchPromotionsWithTimetableStatus avec useCallback
    const fetchPromotionsWithTimetableStatus = useCallback(async (
        weekId = null,
        searchTerm = '',
        page = 1,
        perPage = 10 // Ajoutez perPage pour la pagination
    ) => {
        setLoading(true);
        setError(null);
        try {
            // Construire les paramètres de la requête
            const params = {
                page: page,
                per_page: perPage,
            };
            if (weekId) {
                params.week_id = weekId;
            }
            if (searchTerm) {
                params.search = searchTerm;
            }

            await axios.get('/sanctum/csrf-cookie'); // Assurez-vous que le cookie CSRF est là
            const response = await axios.get('api/timetables/promotions', { params }); 
            const { promotions, current_week_info, stats } = response.data;

            setPromotionsWithTimetableStatus(promotions);
            setCurrentWeekInfo(current_week_info);
            setStats(stats);

            console.log("Promotions avec statut EDT récupérées:", promotions);
            console.log("Infos semaine actuelle:", current_week_info);
            console.log("Stats EDT:", stats);

        } catch (err) {
            console.error("Erreur lors de la récupération des promotions avec statut EDT:", err);
            setError(err);
            toast.error("Erreur lors du chargement des données d'emploi du temps.");
        } finally {
            setLoading(false);
        }
    }, []); // Dépendances vides pour que fetchPromotionsWithTimetableStatus soit stable

    // Vous pouvez déclencher un chargement initial au montage du Provider,
    // par exemple pour la semaine actuelle et sans terme de recherche.
    // Cependant, pour ce cas d'usage, il est souvent préférable de laisser le composant parent
    // déclencher la récupération une fois qu'il a les bons paramètres (ex: la semaine par défaut).
    // useEffect(() => {
    //     fetchPromotionsWithTimetableStatus();
    // }, [fetchPromotionsWithTimetableStatus]);


    // 3. Fournissez les valeurs via le Provider
    const contextValue = {
        promotions: promotionsWithTimetableStatus.data, // Renommé 'promotions' pour la facilité d'utilisation
        pagination: {
            currentPage: promotionsWithTimetableStatus.current_page,
            lastPage: promotionsWithTimetableStatus.last_page,
            total: promotionsWithTimetableStatus.total,
            perPage: promotionsWithTimetableStatus.per_page, // Ajoutez perPage
        },
        currentWeekInfo,
        stats,
        loading,
        error,
        fetchPromotions: fetchPromotionsWithTimetableStatus, // Renommé pour la clarté d'utilisation
    };

    return (
        <TimetableContext.Provider value={contextValue}>
            {children}
        </TimetableContext.Provider>
    );
}

// 4. Créez un hook personnalisé pour consommer le contexte
export function useManageTimetables() {
    const context = useContext(TimetableContext);
    if (context === undefined) {
        throw new Error('useManageTimetables must be used within a TimetableProviderManagement');
    }
    return context;
}