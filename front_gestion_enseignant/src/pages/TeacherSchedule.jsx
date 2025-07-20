import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr'; // Importez la locale française pour Moment.js
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUsers, FaSpinner, FaExclamationCircle, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa'; // Icônes pour les stats et les chevrons
import formatFrenchDate from '../utils/frenchFormatDate';

// Configure Moment.js pour la locale française
moment.updateLocale('fr', {
    week: {
        dow: 1, // Lundi est le premier jour de la semaine (ISO 8601)
        doy: 4  // La première semaine de l'année contient le 4 janvier
    }
});
const localizer = momentLocalizer(moment);

/**
 * Composant StatCard pour afficher une statistique individuelle.
 * @param {object} props - Les props du composant.
 * @param {string} props.title - Le titre de la statistique.
 * @param {string|number} props.value - La valeur de la statistique.
 * @param {React.Component} props.icon - L'icône à afficher.
 * @param {string} props.tint - La classe Tailwind CSS pour la couleur de fond de l'icône.
 */
const StatCard = ({ title, value, icon: Icon, tint }) => (
    <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between border border-gray-100">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${tint}`}>
            <Icon className="w-6 h-6 text-[#0694A2]" /> {/* Utilise la couleur d'accent pour l'icône */}
        </div>
    </div>
);

/**
 * Composant personnalisé pour l'affichage d'un événement dans le calendrier.
 * Affiche le titre du cours, le nom de l'enseignant, la salle et le type de session abrégé.
 * @param {object} props - Les props du composant.
 * @param {object} props.event - L'objet événement contenant les détails de la session.
 */
const EventComponent = ({ event }) => (
    <div className="h-full flex flex-col gap-2 justify-between">
        <div>
            <div className="font-semibold text-xs">{event.title}</div>
            {/* Affichage du nom de l'enseignant */}
            <div className="text-xs opacity-90 mt-1">
                {event.resource.teacherName}
            </div>
            <div className="text-xs opacity-75 mt-1 flex items-center justify-between">
                <div>{event.resource.classroomName}</div>
                <div className="bg-white text-black/90 bg-opacity-20 rounded px-1 inline-block mt-1">
                    {/* Abbrège le type de session (ex: "Cours Magistral" -> "CM") */}
                    {event.resource.type ? event.resource.type.split(' ').map(el => el.charAt(0)).join('') : ''}
                </div>
            </div>
        </div>
    </div>
);

/**
 * Fonction pour déterminer le style d'un événement en fonction de son type de session.
 * @param {object} event - L'objet événement.
 * @returns {object} Un objet de style pour l'événement.
 */
const eventStyleGetter = (event) => {
    console.log("eventStyleGetter: Event Type:", event.resource.type);
    let backgroundColor = '#14B8A6'; // Default: Cours Magistral
    const eventType = event.resource.type ? event.resource.type.trim() : '';

    if (eventType === 'Travaux Pratiques') {
        backgroundColor = '#F59E0B'; // Orange
    } else if (eventType === 'Travaux Dirigés') {
        backgroundColor = '#3B82F6'; // Blue
    } else if (eventType === 'Examen') {
        backgroundColor = '#EF4444'; // Red
    } else if (eventType === 'Cours Magistral') {
        backgroundColor = '#14B8A6'; // Teal
    } else {
        console.warn("eventStyleGetter: Type de session non reconnu, utilisant la couleur par défaut:", eventType);
    }

    return {
        style: {
            backgroundColor: backgroundColor,
            borderRadius: '8px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            fontSize: '12px',
            fontWeight: '500',
            padding: '4px 8px'
        }
    };
};


/**
 * Composant TeacherSchedule pour afficher le planning et les statistiques d'un enseignant.
 */
const TeacherSchedule = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalSessionsOverall: 0,
        currentWeekSessionsCount: 0,
        todaySessionsCount: 0,
        weeklyCompletionPercentage: 0,
    });
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('day'); // Vue par défaut : 'week' pour mieux voir la navigation
    const [date, setDate] = useState(new Date()); // Date actuelle pour le calendrier

    /**
     * Fonction pour récupérer le planning de l'enseignant depuis le backend.
     */
    const fetchTeacherSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Assure que le cookie CSRF est présent pour les requêtes authentifiées
            await axios.get(`http://localhost:8000/sanctum/csrf-cookie`);
            const response = await axios.get(`http://localhost:8000/api/teacher-schedule`);
            setStats(response.data.stats);
            // Transforme les dates des événements en objets Date JavaScript
            const formattedEvents = response.data.events.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Erreur lors de la récupération du planning de l'enseignant:", err);
            // Gère spécifiquement l'erreur 403 (Accès refusé)
            if (axios.isAxiosError(err) && err.response && err.response.status === 403) {
                setError("Accès refusé. Vous n'êtes pas autorisé à voir cette page.");
            } else {
                setError("Une erreur est survenue lors du chargement du planning. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    console.log(events)

    // Effectue la récupération des données au montage du composant
    useEffect(() => {
        fetchTeacherSchedule();
    }, [fetchTeacherSchedule]);

    /**
     * Gère le changement de vue du calendrier (jour, semaine).
     * @param {string} newView - La nouvelle vue ('day' ou 'week').
     */
    const handleViewChange = (newView) => {
        setView(newView);
    };

    /**
     * Gère la navigation dans le calendrier (précédent, suivant, aujourd'hui).
     * @param {Date} newDate - La nouvelle date du calendrier.
     */
    const handleNavigate = (newDate) => {
        setDate(newDate);
    };

    /**
     * Composant de barre d'outils personnalisée pour le calendrier.
     * @param {object} props - Les props passées par react-big-calendar.
     * @param {string} props.label - Le libellé de la vue actuelle (ex: "Juillet 2025").
     * @param {function} props.onNavigate - Fonction de navigation (PREV, NEXT, TODAY).
     * @param {function} props.onView - Fonction pour changer la vue (day, week).
     * @param {string} props.view - La vue actuelle du calendrier.
     * @param {Date} props.date - La date actuellement affichée par le calendrier.
     */
    const CustomToolbar = ({ label, onNavigate, onView, view, date }) => {

        // Fonction pour formater le label de la date en français
        const formatDateLabel = (currentDate, currentView) => {
            moment.locale('fr'); // S'assurer que la locale est bien française
            if (currentView === 'month') {
                return moment(currentDate).format('MMMM YYYY');
            } else if (currentView === 'week') {
                // Pour la vue semaine, on affiche la plage de dates
                const startOfWeek = moment(currentDate).startOf('week');
                const endOfWeek = moment(currentDate).endOf('week');

                // Si la semaine est dans le même mois et la même année
                if (startOfWeek.month() === endOfWeek.month() && startOfWeek.year() === endOfWeek.year()) {
                    return `${formatFrenchDate(startOfWeek.format('DD MMMM YYYY'))} - ${formatFrenchDate(endOfWeek.format('DD MMMM YYYY'))}`;
                } 
                // Si la semaine s'étend sur deux mois mais la même année
                else if (startOfWeek.year() === endOfWeek.year()) {
                    return `${formatFrenchDate(startOfWeek.format('DD MMMM YYYY'))} - ${formatFrenchDate(endOfWeek.format('DD MMMM YYYY'))}`;
                } 
                // Si la semaine s'étend sur deux années différentes
                else {
                    return `${formatFrenchDate(startOfWeek.format('DD MMMM YYYY'))} - ${formatFrenchDate(endOfWeek.format('DD MMMM YYYY'))}`;
                }
            } else if (currentView === 'day') {
                return formatFrenchDate(moment(currentDate).format('dddd DD MMMM YYYY'));
            }
            return ''; // Fallback si la vue n'est pas reconnue
        };

        const formattedLabel = formatDateLabel(date, view);
        console.log("CustomToolbar formattedLabel:", formattedLabel); // Pour le débogage

        return (
            <div className="rbc-toolbar flex flex-col sm:flex-row justify-between items-center mb-4 p-3 bg-white rounded-lg shadow-sm">
                {/* Boutons de vue à gauche pour les petites vues, ou à droite pour les grandes */}
                <div className="flex space-x-2 order-2 sm:order-1 mb-2 sm:mb-0">
                    <button
                        type="button"
                        onClick={() => onView('day')}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'day' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                    >
                        Jour
                    </button>
                    <button
                        type="button"
                        onClick={() => onView('week')}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'week' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                    >
                        Semaine
                    </button>
                    {/* Vous pouvez ajouter un bouton pour la vue 'month' ici si nécessaire */}
                    <button
                        type="button"
                        onClick={() => onView('month')}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'month' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                    >
                        Mois
                    </button>
                </div>

                {/* Section centrale pour la navigation et le label */}
                <div className="flex items-center justify-center space-x-4 order-1 sm:order-2 flex-grow">
                    <button
                        type="button"
                        onClick={() => onNavigate('PREV')}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Previous"
                    >
                        <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="rbc-toolbar-label text-xl font-semibold text-gray-800 capitalize">
                        { formattedLabel }
                    </span>
                    <button
                        type="button"
                        onClick={() => onNavigate('NEXT')}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Next"
                    >
                        <FaChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Bouton "Aujourd'hui" à droite pour les petites vues, ou à gauche pour les grandes */}
                <div className="order-3">
                    <button
                        type="button"
                        onClick={() => onNavigate('TODAY')}
                        className="px-3 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                        Aujourd'hui
                    </button>
                </div>
            </div>
        );
    };

    // Affiche un indicateur de chargement pendant la récupération des données
    if (loading) {
        return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                <p>chargement de votre planning...</p>
            </svg>
        </div>
        );
    }

    // Affiche un message d'erreur si la récupération échoue
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-50 p-6 rounded-lg shadow-md border border-red-200 text-red-700">
                <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
                <p className="text-lg font-semibold mb-2">Erreur de chargement</p>
                <p className="text-center">{error}</p>
                <button
                    onClick={fetchTeacherSchedule}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Mon Planning</h2>

            {/* Grille des statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Sessions cette semaine"
                    value={stats.currentWeekSessionsCount}
                    icon={FaCalendarAlt}
                    tint="bg-blue-100"
                />
                <StatCard
                    title="Sessions aujourd'hui"
                    value={stats.todaySessionsCount}
                    icon={FaClock}
                    tint="bg-green-100"
                />
                <StatCard
                    title="Total sessions"
                    value={stats.totalSessionsOverall}
                    icon={FaUsers}
                    tint="bg-purple-100"
                />
                <StatCard
                    title="Progression hebdo."
                    value={`${stats.weeklyCompletionPercentage}%`}
                    icon={FaCheckCircle}
                    tint="bg-yellow-100"
                />
            </div>

            {/* Calendrier */}
            <div className="bg-white rounded-lg shadow-lg pt-3">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['day', 'week', 'month']}
                    titleAccessor="title"
                    defaultDate={moment().toDate()}
                    view={view}
                    step={4}
                    timeslots={15}
                    onView={handleViewChange}
                    date={date} // Important: Passer la date actuelle au calendrier
                    onNavigate={handleNavigate}
                    style={{ padding: "0 10px" }}
                    formats={{
                        timeGutterFormat: 'HH:mm',
                        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                            localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
                        dayFormat: 'ddd DD',
                        agendaDateFormat: 'dddd DD MMMM',
                        dayHeaderFormat: 'dddd DD MMMM',
                        // Les formats ci-dessous sont moins critiques car nous utilisons notre propre fonction de formatage pour le label de la toolbar
                        // mais ils sont gardés pour la cohérence avec react-big-calendar
                        monthHeaderFormat: 'MMMM YYYY',
                        weekHeaderFormat: 'DD MMMM YYYY', // Exemple pour le header de la semaine
                        dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                            localizer.format(start, 'DD MMMM', culture) + ' - ' + localizer.format(end, 'DD MMMM YYYY', culture),
                    }}
                    messages={{
                        allDay: 'Toute la journée',
                        previous: 'Précédent',
                        next: 'Suivant',
                        today: 'Aujourd\'hui',
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        agenda: 'Agenda',
                        date: 'Date',
                        time: 'Heure',
                        event: 'Événement',
                        noEventsInRange: 'Aucun événement dans cette plage.',
                    }}
                    components={{
                        // Passer la date actuelle au CustomToolbar pour un formatage manuel
                        toolbar: (toolbarProps) => <CustomToolbar {...toolbarProps} date={date} />,
                        event: EventComponent,
                    }}
                    eventPropGetter={eventStyleGetter}
                    min={new Date(moment().startOf('day').hours(7).minutes(0).seconds(0))}
                    max={new Date(moment().endOf('day').hours(22).minutes(0).seconds(0))}
                />
            </div>
            {/* Légende */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Légende des couleurs :</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#14B8A6] rounded"></div>
                        <span>Cours Magistral (CM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#F59E0B] rounded"></div>
                        <span>Travaux Pratiques (TP)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#3B82F6] rounded"></div>
                        <span>Travaux Dirigés (TD)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
                        <span>Examen</span>
                    </div>
                </div>
            </div>


            {/* Message d'aide */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FaInfoCircle className="text-[#0694A2]" />
                    Cliquez sur une cellule vide pour ajouter une nouvelle session de cours.
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="bg-white border px-2 py-1 rounded">CM</span>
                        Cours magistral
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="bg-white border px-2 py-1 rounded">TD</span>
                        Travaux dirigés
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="bg-white border px-2 py-1 rounded">TP</span>
                        Travaux pratiques
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="bg-white border px-2 py-1 rounded">Examen</span>
                        Examen
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TeacherSchedule;
