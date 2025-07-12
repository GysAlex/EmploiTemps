import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaEye, FaEdit, FaCalendarAlt, FaClock, FaUsers, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useManageTimetables } from '../hooks/useManageTimeTables';
import { TimetableSkeletonLoader } from '../components/skeletons/TimeTableSkeletonLoader'; // <-- Assurez-vous que ce chemin est correct
import formatFrenchDate from '../utils/frenchFormatDate'; // <-- Assurez-vous que ce chemin est correct et que la fonction est exportée par défaut


// Fonction utilitaire pour obtenir la couleur du statut
const getStatusColor = (status) => {
    switch (status) {
        case 'Publié': return 'bg-green-100 text-green-700 border-green-200';
        case 'En attente': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Mis à jour': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

// Fonction utilitaire pour obtenir la couleur du niveau
const getNiveauColor = (level) => {
    switch (level) {
        case 'Licence 1': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Licence 2': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Licence 3': return 'bg-pink-100 text-pink-700 border-pink-200';
        case 'Master 1': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'Master 2': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Niveau 1': return 'bg-blue-100 text-blue-700 border-blue-200'; // Ajout pour correspondre à votre fichier
        case 'Niveau 2': return 'bg-green-100 text-green-700 border-green-200'; // Ajout pour correspondre à votre fichier
        case 'Niveau 3': return 'bg-purple-100 text-purple-700 border-purple-200'; // Ajout pour correspondre à votre fichier
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function TimeTableList() {
    const [selectedWeekId, setSelectedWeekId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Tous les niveaux');
    const [currentPage, setCurrentPage] = useState(1);
    const [weeks, setWeeks] = useState([]);

    const { promotions, pagination, currentWeekInfo, stats, loading, error, fetchPromotions } = useManageTimetables();

    // Effet pour récupérer toutes les semaines disponibles (s'exécute une seule fois au montage)
    useEffect(() => {
        const fetchAllWeeks = async () => {
            try {
                const response = await axios.get('/api/weeks');
                setWeeks(response.data);
                if (response.data.length > 0) {
                    const current = response.data.find(w => w.is_current);
                    // Si aucune semaine n'est déjà sélectionnée, ou si la semaine actuelle n'a pas encore été définie
                    if (selectedWeekId === null || !currentWeekInfo) {
                        if (current) {
                            setSelectedWeekId(current.id);
                        } else {
                            setSelectedWeekId(response.data[0].id); // Sélectionne la première si aucune actuelle
                            console.log("or here")

                        }
                    }
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des semaines:", err);
            }
        };
        fetchAllWeeks();
    }, [currentWeekInfo]); // Dépendance à currentWeekInfo pour s'assurer que la sélection initiale se fait bien après avoir l'info de la semaine courante

    // Effet pour déclencher la récupération des promotions lorsque la semaine, le terme de recherche ou la page change
    useEffect(() => {
        if (selectedWeekId) {
            // Le hook useManageTimetables devrait gérer son propre état de chargement et le mettre à jour
            fetchPromotions(selectedWeekId, searchTerm, currentPage, 10); // 10 par page
        }
    }, [selectedWeekId, searchTerm, currentPage, fetchPromotions]);

    // Logique de filtrage du NIVEAU côté FRONTEND
    const filteredPromotionsByLevel = useMemo(() => {
        if (selectedLevel === 'Tous les niveaux') {
            return promotions;
        }
        // Utilise includes pour une meilleure flexibilité si le niveau est "Niveau 1" ou "Licence 1"
        return promotions.filter(p => p.level.includes(selectedLevel.replace('Tous les niveaux', '').trim()));
    }, [promotions, selectedLevel]);

    // Fonctions pour naviguer entre les semaines
    const handlePreviousWeek = () => {
        const currentIndex = weeks.findIndex(week => week.id === selectedWeekId);
        if (currentIndex > 0) {
            setSelectedWeekId(weeks[currentIndex - 1].id);
            setCurrentPage(1); // Réinitialiser la page quand la semaine change
        }
    };

    const handleNextWeek = () => {
        const currentIndex = weeks.findIndex(week => week.id === selectedWeekId);
        if (currentIndex < weeks.length - 1) {
            setSelectedWeekId(weeks[currentIndex + 1].id);
            setCurrentPage(1); // Réinitialiser la page quand la semaine change
        }
    };

    // Obtient les informations détaillées de la semaine actuellement affichée dans le sélecteur
    const displayedWeek = useMemo(() => {
        return weeks.find(week => week.id === selectedWeekId);
    }, [weeks, selectedWeekId]);


    console.log('displayedWeek:', displayedWeek, 'currentWeek:', currentWeekInfo);
    

    // NOUVEAU : Calcul du statut de la semaine affichée par rapport à la semaine actuelle du système
    const weekStatus = useMemo(() => {

        if (!displayedWeek || !currentWeekInfo) {
            console.log('condition 1')
            return null; // Encore en chargement ou informations manquantes
        }
        if (displayedWeek.week_id === parseInt(currentWeekInfo.name.split(' ')[1])) {
            return { text: 'Actuelle', color: 'bg-green-500', textColor: 'text-white' };
        }
        // Supposons que les IDs de semaine sont numériques et s'incrémentent
        if (displayedWeek.week_id < parseInt(currentWeekInfo.name.split(' ')[1])) {
            console.log('condition 3');
            return { text: 'Passée', color: 'bg-orange-500', textColor: 'text-white' };
        }
        return { text: 'Future', color: 'bg-blue-500', textColor: 'text-white' };
    }, [displayedWeek?.week_id, currentWeekInfo]);

    // Chargement initial ou état d'erreur global
    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 text-center text-red-600">
                <FaExclamationCircle className="inline-block mr-2" /> Erreur lors du chargement des données : {error.message || 'Une erreur est survenue.'}
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="my-2 text-md text-[#0694A2] flex flex-col gap-3 items-stretch justify-center">
                <Link to={-1} className='flex items-center w-fit rounded-2xl gap-2 px-3 py-2 text-white bg-[#0694A2] '>
                    <i className="fa-solid fa-arrow-left"></i>retour
                </Link>
                <span>gestion des emplois de temps</span>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Stats Cards - Ces cartes devraient être mises à jour par le hook useManageTimetables */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Carte Semaine Actuelle (ne change pas avec la navigation des semaines, c'est la semaine système) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Semaine actuelle</p>
                                <p className="text-2xl font-bold text-cyan-600 mt-1">{currentWeekInfo?.name || 'N/A'}</p>
                                <p className="text-xs text-slate-500 mt-1">{formatFrenchDate(currentWeekInfo?.start_date) + " au " + formatFrenchDate(currentWeekInfo?.end_date) || 'Chargement...'}</p>
                            </div>
                            <div className="bg-cyan-100 p-3 rounded-xl">
                                <FaCalendarAlt className="text-cyan-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Total des emplois du temps (devrait être lié à la selectedWeekId via le hook) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total des emplois du temps</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalEmplois ?? '...'}</p>
                                <p className="text-xs text-slate-500 mt-1">emplois du temps</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-xl">
                                <FaClock className="text-slate-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Emplois du temps définis (devrait être lié à la selectedWeekId via le hook) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Emplois du temps définis</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats?.emploisDefinis ?? '...'}%</p>
                                <p className="text-xs text-slate-500 mt-1">des promotions</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl">
                                <FaUsers className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* En attente (promotions sans EDT) (devrait être lié à la selectedWeekId via le hook) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">En attente</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{stats?.promotionsSansEDT ?? '...'}</p>
                                <p className="text-xs text-slate-500 mt-1">promotions sans EDT</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <FaExclamationCircle className="text-orange-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            {/* Sélecteur de semaine */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handlePreviousWeek}
                                    className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                                    disabled={loading || weeks.findIndex(week => week.id === selectedWeekId) === 0}
                                >
                                    <FaChevronLeft />
                                </button>
                                <div className="border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 w-full sm:w-auto text-center flex flex-col justify-center items-center relative"> {/* Ajout de 'relative' */}
                                    <div className="text-sm font-medium">
                                        Semaine {displayedWeek?.week_id || '...'}
                                    </div>
                                    {displayedWeek && (
                                        <span className="text-xs text-slate-500 mt-1">
                                            {`${formatFrenchDate(displayedWeek.start_date)} - ${formatFrenchDate(displayedWeek.end_date)}`}
                                        </span>
                                    )}
                                    {/* NOUVEAU : Indicateur de statut de la semaine */}
                                    {weekStatus && (
                                        <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${weekStatus.color} ${weekStatus.textColor} shadow-sm`}>
                                            {weekStatus.text}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleNextWeek}
                                    className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                                    disabled={loading || weeks.findIndex(week => week.id === selectedWeekId) === weeks.length - 1}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>

                            {/* Filtre de niveau (Select) */}
                            <select
                                id="level-filter"
                                name="level-filter"
                                className="border text-sm border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 w-full sm:w-auto"
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                disabled={loading}
                            >
                                <option>Tous les niveaux</option>
                                <option>Niveau 1</option>
                                <option>Niveau 2</option>
                                <option>Niveau 3</option>
                                {/* Ajoutez ici les autres niveaux si nécessaire (Licence, Master...) */}
                            </select>
                        </div>

                        {/* Search Bar and Filters Button */}
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="search-promotions"
                                    name="search-promotions"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors duration-200"
                                    placeholder="Rechercher promotion..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* DÉBUT DE LA LOGIQUE DE RENDU CONDITIONNEL POUR LE SKELETON OU LES DONNÉES */}
                {/* MODIFICATION ICI : Afficher le skeleton si 'loading' est vrai, indépendamment de promotions.length */}
                {loading ? (
                    // Affiche le skeleton pendant le chargement
                    <TimetableSkeletonLoader count={5} />
                ) : (
                    // Utilisation d'un fragment pour envelopper les deux vues (Desktop et Mobile)
                    <>
                        {/* Table Desktop */}
                        <div className="hidden lg:block">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Semaine</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Niveau</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Promotion</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut EDT</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredPromotionsByLevel.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-slate-500">
                                                    Aucune promotion trouvée pour cette semaine ou ces critères.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPromotionsByLevel.map(promotion => (
                                                <tr key={promotion.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out rounded" />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">Sem. {promotion.week_id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNiveauColor(promotion.level)}`}>
                                                            {promotion.level}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                        <div className="flex items-center">
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-slate-900">{promotion.name}</div>
                                                                <div className="text-sm text-slate-500">{promotion.slug}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(promotion.timetable_status)}`}>
                                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                                promotion.timetable_status === 'Publié' ? 'bg-green-500' :
                                                                promotion.timetable_status === 'En attente' ? 'bg-orange-500' : 'bg-blue-500'
                                                            }`}></div>
                                                            {promotion.timetable_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <Link to={`/admin/timetables/promotion/${promotion.id}/${selectedWeekId}`} className="text-slate-600 hover:text-slate-900">
                                                                <FaEye className="h-5 w-5" />
                                                            </Link>
                                                            <Link to={`/admin/timetables/promotion/${promotion.id}/${selectedWeekId}/edit`} className="text-cyan-600 hover:text-cyan-900">
                                                                <FaEdit className="h-5 w-5" />
                                                            </Link>
                                                            {promotion.timetable_status === 'En attente' ? (
                                                                <Link to={`/timetables/${promotion.id}/create?week_id=${selectedWeekId}`} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                                                                    Ajouter l'EDT
                                                                </Link>
                                                            ) : (
                                                                <Link to={`/timetables/${promotion.id}/update?week_id=${selectedWeekId}`} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                                                                    Mettre à jour l'EDT
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Vue mobile (cartes) */}
                        <div className="block lg:hidden">
                            <div className="space-y-4">
                                {filteredPromotionsByLevel.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                                        <div className="text-slate-400 mb-2">
                                            <FaCalendarAlt className="text-5xl mx-auto" />
                                        </div>
                                        <p className="text-slate-500 text-sm">Aucun emploi du temps trouvé pour les critères sélectionnés.</p>
                                    </div>
                                ) : (
                                    filteredPromotionsByLevel.map(promotion => (
                                        <div key={promotion.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-medium text-slate-900 truncate">
                                                            {promotion.name}
                                                        </h3>
                                                        <div className="flex space-x-2">
                                                            {(promotion.timetable_status === 'Publié' || promotion.timetable_status === 'Mis à jour') && (
                                                                <Link to={`/timetables/${promotion.id}/view?week_id=${selectedWeekId}`} className="text-cyan-600 hover:text-cyan-800 transition-colors duration-150 p-1 rounded-lg hover:bg-cyan-50">
                                                                    <FaEye />
                                                                </Link>
                                                            )}
                                                            <Link to={`/timetables/${promotion.id}/edit?week_id=${selectedWeekId}`} className="text-cyan-600 hover:text-cyan-800 transition-colors duration-150 p-1 rounded-lg hover:bg-cyan-50">
                                                                <FaEdit />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm text-slate-600">
                                                            {promotion.week_name}
                                                        </span>
                                                        <span className="text-slate-400">•</span>
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getNiveauColor(promotion.level)}`}>
                                                            {promotion.level}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(promotion.timetable_status)}`}>
                                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                                promotion.timetable_status === 'Publié' ? 'bg-green-500' :
                                                                promotion.timetable_status === 'En attente' ? 'bg-orange-500' : 'bg-blue-500'
                                                            }`}></div>
                                                            {promotion.timetable_status}
                                                        </span>
                                                        {promotion.timetable_status === 'En attente' ? (
                                                            <Link to={`/timetables/${promotion.id}/create?week_id=${selectedWeekId}`} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                                                                Ajouter l'EDT
                                                            </Link>
                                                        ) : (
                                                            <Link to={`/timetables/${promotion.id}/update?week_id=${selectedWeekId}`} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                                                                Mettre à jour l'EDT
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )} {/* FIN DE LA LOGIQUE DE RENDU CONDITIONNEL */}

                {/* Pagination commune pour Desktop et Mobile */}
                {/* Elle s'affiche uniquement si le chargement est terminé ET qu'il y a des promotions à paginer */}
                {!loading && filteredPromotionsByLevel.length > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-2xl mt-6"> {/* Ajout de mt-6 pour espacement */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                Affichage de {((pagination.currentPage - 1) * pagination.perPage) + 1} à {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} sur {pagination.total} promotions
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors duration-150"
                                    disabled={pagination.currentPage === 1 || loading}
                                >
                                    <FaChevronLeft />
                                </button>
                                {/* Affichage des numéros de page si nécessaire, sinon juste la page courante */}
                                <span className="px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg">
                                    {pagination.currentPage} / {pagination.lastPage || 1}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.lastPage, prev + 1))}
                                    className="px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors duration-150"
                                    disabled={pagination.currentPage === pagination.lastPage || loading}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
            
        </div>
    );
}