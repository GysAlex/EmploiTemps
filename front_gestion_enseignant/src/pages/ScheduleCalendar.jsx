import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'moment/locale/fr'; // Importez la locale française pour Moment.js
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams, Link, useSearchParams } from 'react-router-dom'; // Importez useParams, Link et useSearchParams
import axios from 'axios';
import { toast } from 'sonner'; // Importez toast et Toaster de sonner
import { useModal } from '../hooks/useModal';
import formatFrenchDate from '../utils/frenchFormatDate';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { FaSpinner, FaInfoCircle, FaCalendarAlt, FaChalkboardTeacher, FaBook, FaDoorOpen, FaUpload } from 'react-icons/fa'; // Icônes pour les filtres et le bouton publier
import CourseSessionModal from '../components/modals/CourseSessionModal';

// Les imports des composants de modale sont retirés car vous utilisez votre propre système.
// import CourseSessionFormModal from '../components/modals/CourseSessionFormModal';
// import CourseSessionForm from '../components/forms/CourseSessionForm';

// Configure Moment.js pour la locale française
moment.updateLocale('fr', {
    week: {
        dow: 1,
        doy: 1
    }
});

const localizer = momentLocalizer(moment);

// Configuration Axios (assurez-vous que c'est fait une seule fois au niveau global)
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Mappage des noms de jours de la semaine du français vers l'anglais
const frenchToEnglishDays = {
    'lundi': 'monday',
    'mardi': 'tuesday',
    'mercredi': 'wednesday',
    'jeudi': 'thursday',
    'vendredi': 'friday',
    'samedi': 'saturday',
    'dimanche': 'sunday'
};

const DragAndDropCalendar = withDragAndDrop(Calendar);


const ScheduleCalendar = () => {
    const { promotionId, action } = useParams();
    const [searchParams] = useSearchParams();
    const weekId = searchParams.get('week_id');

    const { openModal, closeModal } = useModal();
    // const toast = useToast(); // Supprimé : n'utilisons plus votre hook personnalisé

    const [promotionDetails, setPromotionDetails] = useState(null);
    const [weekDetails, setWeekDetails] = useState(null);
    const [currentTimetableId, setCurrentTimetableId] = useState(null);
    const [courseSessions, setCourseSessions] = useState([]);
    const [promotionLevel, setPromotionLevel] = useState(null); // Nouvel état pour le niveau de la promotion


    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    const [selectedTeacher, setSelectedTeacher] = useState('Tous les enseignants');
    const [selectedRoom, setSelectedRoom] = useState('Toutes les salles');
    const [selectedCourse, setSelectedCourse] = useState('Tous les cours');

    const [loadingPageData, setLoadingPageData] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [error, setError] = useState(null);

    // Suppression des états toastMessage et toastType locaux, et de l'effet associé
    // car sonner gère cela en interne.

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingPageData(true);
            setError(null);
            try {
              let currentPromotionLevel = null;
                if (promotionId) {
                    const promotionResponse = await axios.get(`http://localhost:8000/api/promotions/${promotionId}`);
                    currentPromotionLevel = promotionResponse.data.data.level;
                    setPromotionDetails(promotionResponse.data.data)
                    setPromotionLevel(currentPromotionLevel);
                }

                const coursesUrl = currentPromotionLevel
                    ? `http://localhost:8000/api/courses?level=${encodeURIComponent(currentPromotionLevel)}`
                    : `http://localhost:8000/api/courses`;

                const weekRes = await axios.get(`/api/weeks/${weekId}`);
                setWeekDetails(weekRes.data);

                const timetableCheckOrCreateRes = await axios.post('/api/timetables/check-or-create', {
                    promotion_id: promotionId,
                    week_id: weekId
                });
                const fetchedTimetableId = timetableCheckOrCreateRes.data.timetable.id;
                setCurrentTimetableId(fetchedTimetableId);

                const sessionsRes = await axios.get(`/api/timetables/${fetchedTimetableId}/sessions`);
                console.log("DEBUG SC: Raw sessions from backend (sessionsRes.data):", sessionsRes.data);

                const formattedSessions = sessionsRes.data.map(session => {
                    console.log("DEBUG SC: Processing raw session:", session);
                    console.log("DEBUG SC: Raw session ID:", session.id);
                    console.log("DEBUG SC: Raw session type (for color debug):", session.session_type);

                    if (!weekRes.data || !weekRes.data.start_date) {
                        console.warn("DEBUG SC: weekDetails ou weekDetails.start_date non défini lors du formatage initial des sessions. Retour à la date actuelle.");
                        return {
                            id: session.id,
                            title: session.course?.name || 'Cours Inconnu',
                            start: new Date(),
                            end: new Date(),
                            resource: {
                                type: session.session_type,
                                room: session.classroom?.name || 'Salle Inconnue',
                                teacher: session.teacher?.name || 'Enseignant Inconnu',
                            },
                            rawSessionData: session
                        };
                    }

                    const englishDayOfWeek = frenchToEnglishDays[session.time_slot.day_of_week.toLowerCase()];
                    if (!englishDayOfWeek) {
                        console.error(`DEBUG SC: Jour de la semaine invalide '${session.time_slot.day_of_week}' du backend.`);
                        return {
                            id: session.id,
                            title: session.course?.name || 'Cours Inconnu',
                            start: new Date(),
                            end: new Date(),
                            resource: {
                                type: session.session_type,
                                room: session.classroom?.name || 'Salle Inconnue',
                                teacher: session.teacher?.name || 'Enseignant Inconnu',
                            },
                            rawSessionData: session
                        };
                    }

                    let sessionStartMoment = moment(weekRes.data.start_date).day(englishDayOfWeek);

                    if (sessionStartMoment.isBefore(moment(weekRes.data.start_date), 'day')) {
                        sessionStartMoment.add(7, 'days');
                    }

                    const [hours, minutes, seconds] = session.time_slot.start_time.split(':').map(Number);
                    sessionStartMoment.set({ hours, minutes, seconds });

                    const sessionEndMoment = moment(sessionStartMoment).add(session.duration_minutes, 'minutes');

                    const formattedSession = {
                        id: session.id,
                        title: session.course?.name || 'Cours Inconnu',
                        start: sessionStartMoment.toDate(),
                        end: sessionEndMoment.toDate(),
                        resource: {
                            type: session.session_type,
                            room: session.classroom?.name || 'Salle Inconnue',
                            teacher: session.teacher?.name || 'Enseignant Inconnu',
                        },
                        rawSessionData: session
                    };
                    console.log("DEBUG SC: Session formatée créée:", formattedSession);
                    return formattedSession;
                });
                setCourseSessions(formattedSessions);

                const [teachersRes, roomsRes, coursesRes, timeSlotsRes] = await Promise.all([
                    axios.get('/api/teachers'),
                    axios.get('/api/classrooms'),
                    axios.get(coursesUrl),
                    axios.get('/api/time-slots'),
                ]);

                setTeachers(teachersRes.data);
                setRooms(roomsRes.data);
                setCourses(coursesRes.data);
                setTimeSlots(timeSlotsRes.data);

            } catch (err) {
                console.error("Erreur lors du chargement initial des données:", err);
                setError(err);
            } finally {
                setLoadingPageData(false);
            }
        };

        fetchInitialData();
    }, [promotionId, weekId]);

    const filterTeachers = useMemo(() => ['Tous les enseignants', ...teachers.map(t => t.name)], [teachers]);
    const filterRooms = useMemo(() => ['Toutes les salles', ...rooms.map(r => r.name)], [rooms]);
    const filterCourses = useMemo(() => ['Tous les cours', ...courses.map(c => c.name)], [courses]);

    useEffect(() => {
        // Cette logique ne fait rien d'autre que de déclencher le useMemo si les dépendances changent.
    }, [selectedTeacher, selectedRoom, selectedCourse]);

    const filteredEvents = useMemo(() => {
        if (loadingPageData) return [];
        return courseSessions.filter(event => {
            const teacherMatch = selectedTeacher === 'Tous les enseignants' || event.resource.teacher === selectedTeacher;
            const roomMatch = selectedRoom === 'Toutes les salles' || event.resource.room === selectedRoom;
            const courseMatch = selectedCourse === 'Tous les cours' || event.title === selectedCourse;
            return teacherMatch && roomMatch && courseMatch;
        });
    }, [selectedTeacher, selectedRoom, selectedCourse, courseSessions, loadingPageData]);

    const eventStyleGetter = (event) => {
        console.log("eventStyleGetter: Event Type:", event.resource.type);
        let backgroundColor = '#14B8A6'; // Default: Cours Magistral
        const eventType = event.resource.type ? event.resource.type.trim() : '';

        if (eventType === 'Travaux Pratiques') {
            backgroundColor = '#F59E0B';
        } else if (eventType === 'Travaux Dirigés') {
            backgroundColor = '#3B82F6';
        } else if (eventType === 'Examen') {
            backgroundColor = '#EF4444';
        } else if (eventType === 'Cours Magistral') {
            backgroundColor = '#14B8A6';
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

    const EventComponent = ({ event }) => (
        <div className="h-full flex flex-col gap-2 justify-between">
            <div>
                <div className="font-semibold text-xs">{event.title}</div>
                {/* Affichage du nom de l'enseignant à la place du temps */}
                <div className="text-xs opacity-90 mt-1">
                    {event.resource.teacher}
                </div>
                <div className="text-xs opacity-75 mt-1 flex items-center justify-between">
                    <div>{event.resource.room}</div>
                    <div className="bg-white text-black/90 bg-opacity-20 rounded px-1 inline-block mt-1">
                        {event.resource.type.split(' ').map(el => el.charAt(0)).join('')}
                    </div>
                </div>
            </div>

        </div>
    );

    const handleSessionSave = (newOrUpdatedSessionData) => {
        console.log("--- handleSessionSave (ScheduleCalendar): Début ---");
        console.log("handleSessionSave (ScheduleCalendar): newOrUpdatedSessionData (reçues de la modale):", newOrUpdatedSessionData);
        console.log("handleSessionSave (ScheduleCalendar): ID de newOrUpdatedSessionData:", newOrUpdatedSessionData.id);

        if (!weekDetails || !weekDetails.start_date) {
            console.error("handleSessionSave (ScheduleCalendar): weekDetails ou weekDetails.start_date n'est pas défini. Impossible de sauvegarder la session.");
            toast.error("Erreur: Informations de semaine manquantes. Impossible de sauvegarder la session.");
            return;
        }

        const selectedTimeSlot = timeSlots.find(ts => ts.id === newOrUpdatedSessionData.time_slot_id);
        if (!selectedTimeSlot) {
            console.error("handleSessionSave (ScheduleCalendar): Créneau horaire sélectionné introuvable.");
            toast.error("Erreur: Créneau horaire sélectionné introuvable.");
            return;
        }

        const englishDayOfWeek = frenchToEnglishDays[selectedTimeSlot.day_of_week.toLowerCase()];
        if (!englishDayOfWeek) {
            console.error(`handleSessionSave (ScheduleCalendar): Nom du jour '${selectedTimeSlot.day_of_week}' non reconnu pour la conversion.`);
            toast.error("Erreur: Jour de la semaine non reconnu pour le créneau horaire.");
            return;
        }

        let sessionStartMoment = moment(weekDetails.start_date).day(englishDayOfWeek);

        if (sessionStartMoment.isBefore(moment(weekDetails.start_date), 'day')) {
            sessionStartMoment.add(7, 'days');
        }

        const [hours, minutes, seconds] = selectedTimeSlot.start_time.split(':').map(Number);
        sessionStartMoment.set({ hours, minutes, seconds });

        const sessionEndMoment = moment(sessionStartMoment).add(newOrUpdatedSessionData.duration_minutes, 'minutes');

        const formattedNewOrUpdatedSession = {
            id: newOrUpdatedSessionData.id || `temp-${Date.now()}`,
            title: courses.find(c => c.id === newOrUpdatedSessionData.course_id)?.name || 'Cours Inconnu',
            start: sessionStartMoment.toDate(),
            end: sessionEndMoment.toDate(),
            resource: {
                type: newOrUpdatedSessionData.session_type,
                room: rooms.find(r => r.id === newOrUpdatedSessionData.room_id)?.name || 'Salle Inconnue',
                teacher: teachers.find(t => t.id === newOrUpdatedSessionData.teacher_id)?.name || 'Enseignant Inconnu',
            },
            rawSessionData: newOrUpdatedSessionData
        };

        console.log("handleSessionSave (ScheduleCalendar): formattedNewOrUpdatedSession (avec ID pour comparaison):", formattedNewOrUpdatedSession);

        setCourseSessions(prevSessions => {
            console.log("handleSessionSave (ScheduleCalendar): prevSessions (IDs avant findIndex):", prevSessions.map(s => s.id));
            const existingIndex = prevSessions.findIndex(s => s.id === formattedNewOrUpdatedSession.id);
            console.log("handleSessionSave (ScheduleCalendar): Résultat findIndex (existingIndex):", existingIndex);

            if (existingIndex > -1) {
                console.log("handleSessionSave (ScheduleCalendar): Mise à jour de la session existante avec ID:", formattedNewOrUpdatedSession.id);
                const updatedSessions = [...prevSessions];
                updatedSessions[existingIndex] = formattedNewOrUpdatedSession;
                toast.success("Session mise à jour avec succès !");
                return updatedSessions;
            } else {
                console.log("handleSessionSave (ScheduleCalendar): Ajout d'une nouvelle session avec ID:", formattedNewOrUpdatedSession.id);
                toast.success("Session ajoutée avec succès !");
                return [...prevSessions, formattedNewOrUpdatedSession];
            }
        });
        closeModal();
        console.log("--- handleSessionSave (ScheduleCalendar): Fin ---");
    };

    const onEventDrop = ({ event, start, end, isAllDay }) => {
        console.log("onEventDrop: Event dropped!", { event, start, end, isAllDay });
        setCourseSessions(prevSessions => {
            const updatedSessions = prevSessions.map(existingEvent => {
                if (existingEvent.id === event.id) {
                    const updatedEvent = { ...existingEvent, start, end, isAllDay };

                    const newDurationMinutes = moment(end).diff(moment(start), 'minutes');
                    const newDayOfWeek = moment(start).format('dddd').toLowerCase();
                    const newStartTime = moment(start).format('HH:mm:ss');

                    const newTimeSlot = timeSlots.find(ts =>
                        frenchToEnglishDays[ts.day_of_week.toLowerCase()] === newDayOfWeek &&
                        ts.start_time === newStartTime
                    );

                    if (newTimeSlot) {
                        updatedEvent.rawSessionData = {
                            ...updatedEvent.rawSessionData,
                            time_slot_id: newTimeSlot.id,
                            duration_minutes: newDurationMinutes,
                            time_slot: {
                                ...updatedEvent.rawSessionData.time_slot,
                                day_of_week: newTimeSlot.day_of_week,
                                start_time: newTimeSlot.start_time,
                                end_time: newTimeSlot.end_time,
                            }
                        };
                        toast.success("Session déplacée avec succès ! N'oubliez pas de publier.");
                    } else {
                        console.warn("onEventDrop: Nouveau créneau horaire introuvable pour la session déplacée. rawSessionData.time_slot_id ne sera pas mis à jour.");
                        toast.error("Attention: Créneau horaire exact non trouvé après le déplacement. La session pourrait ne pas être sauvegardée correctement sans publication.");
                    }
                    return updatedEvent;
                }
                return existingEvent;
            });
            return updatedSessions;
        });
    };

    const onEventResize = ({ event, start, end, isAllDay }) => {
        console.log("onEventResize: Event resized!", { event, start, end, isAllDay });

        setCourseSessions(prevSessions => {
            const updatedSessions = prevSessions.map(existingEvent => {
                if (existingEvent.id === event.id) {
                    const updatedEvent = { ...existingEvent, start, end, isAllDay };

                    const newDurationMinutes = moment(end).diff(moment(start), 'minutes');
                    updatedEvent.rawSessionData = {
                        ...updatedEvent.rawSessionData,
                        duration_minutes: newDurationMinutes
                    };
                    toast.success("Session redimensionnée avec succès ! N'oubliez pas de publier.");
                    return updatedEvent;
                }
                return existingEvent;
            });
            return updatedSessions;
        });
    };


    const handleSelectSlot = ({ start, end }) => {
        if (!currentTimetableId) {
            console.error("Erreur: L'emploi du temps n'a pas pu être chargé ou créé. Impossible d'ajouter une session.");
            toast.error("Erreur: L'emploi du temps n'a pas pu être chargé ou créé. Impossible d'ajouter une session.");
            return;
        }
        console.log("handleSelectSlot (ScheduleCalendar): Ouverture modale pour NOUVELLE session. slotInfo:", { start, end });
        openModal(
            CourseSessionModal,
            {
                promotionId: promotionId,
                weekId: weekId,
                timetableId: currentTimetableId,
                slotInfo: { start, end },
                onSave: handleSessionSave,
                onCancel: closeModal,
                teachers: teachers,
                rooms: rooms,
                courses: courses,
                timeSlots: timeSlots,
                existingSessions: courseSessions,
                weekDetails: weekDetails,
            }
        );
    };

    const handleSelectEvent = (event) => {
        if (!currentTimetableId) {
            console.error("Erreur: L'emploi du temps n'a pas pu être chargé ou créé. Impossible d'éditer une session.");
            toast.error("Erreur: L'emploi du temps n'a pas pu être chargé ou créé. Impossible d'éditer une session.");
            return;
        }
        console.log("handleSelectEvent (ScheduleCalendar): Ouverture modale pour ÉDITION session.");
        console.log("handleSelectEvent (ScheduleCalendar): Objet Event de react-big-calendar:", event);
        console.log("handleSelectEvent (ScheduleCalendar): ID de l'Event:", event.id);
        console.log("handleSelectEvent (ScheduleCalendar): ID de Event.rawSessionData:", event.rawSessionData?.id);

        openModal(
            CourseSessionModal,
            {
                promotionId: promotionId,
                weekId: weekId,
                timetableId: currentTimetableId,
                initialData: event,
                onSave: handleSessionSave,
                onCancel: closeModal,
                teachers: teachers,
                rooms: rooms,
                courses: courses,
                timeSlots: timeSlots,
                existingSessions: courseSessions,
                weekDetails: weekDetails,
            }
        );
    };

    const handlePublish = async () => {
        if (!currentTimetableId) {
            toast.error("Erreur: L'emploi du temps n'a pas pu être chargé ou créé. Impossible de publier.");
            return;
        }

        setLoadingSessions(true);
        // Sauvegarder l'état actuel des sessions avant la tentative de publication
        const previousSessionsState = [...courseSessions];

        try {
            const sessionsToSync = courseSessions.map(session => {
                const sessionData = { ...session.rawSessionData, timetable_id: currentTimetableId };
                if (typeof sessionData.id === 'string' && sessionData.id.startsWith('temp-')) {
                    delete sessionData.id;
                }
                return sessionData;
            });
            console.log("handlePublish (ScheduleCalendar): Sessions à synchroniser:", sessionsToSync);

            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post(`/api/timetables/${currentTimetableId}/sessions/sync`, { sessions: sessionsToSync });
            console.log("Publication réussie:", response.data);
            toast.success("Emploi du temps publié avec succès !");

            // Recharger la page après un court délai pour que le toast soit visible
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error("Erreur lors de la publication de l'emploi du temps:", err);

            // AJOUT : Si l'erreur est un conflit (409), restaurer l'état précédent
            if (err.response && err.response.status === 409) {
                console.log("Erreur 409 détectée. Restauration de l'état précédent du calendrier.");
                setCourseSessions(previousSessionsState); // Restaurer l'état précédent
            }

            const errorMessage = err.response?.data?.message || "Erreur lors de la publication de l'emploi du temps. Veuillez vérifier la console.";
            toast.error(errorMessage);
            setError(err);
        } finally {
            setLoadingSessions(false);
        }
    };

    console.log(promotionDetails)
    const defaultCalendarDate = weekDetails ? new Date(weekDetails.start_date) : new Date();

    if (loadingPageData) {
        return (
            <div className="flex justify-center items-center h-[90vh]">
                <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    // if (error) {
    //     return (
    //         <div className="min-h-screen flex justify-center items-center bg-red-50 text-red-700">
    //             <FaInfoCircle className="inline-block mr-2" />
    //             <p className="text-xl">Erreur lors du chargement : {error.message || "Une erreur est survenue."}</p>
    //         </div>
    //     );
    // }

    if (!promotionDetails || !weekDetails) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl text-gray-500">Promotion ou semaine non trouvée.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center text-[#0694A2] mb-4">
                        <Link to={-1} className="flex items-center gap-2 px-3 py-2 bg-[#0694A2] text-white rounded-2xl hover:bg-[#057A86] transition-colors">
                            <i className="fas fa-arrow-left"></i>
                            retour
                        </Link>
                    </div>

                    <div className="mb-4">
                        <h1 className="text-[#0694A2] font-semibold text-lg">
                            Promotion <span className="text-gray-600">: {promotionDetails.name}</span>
                        </h1>
                        <h2 className="text-[#0694A2] font-semibold">
                            Semaine <span className="text-gray-600">: {weekDetails.week_id} ({formatFrenchDate(weekDetails.start_date)} - {formatFrenchDate(weekDetails.end_date)})</span>
                        </h2>
                    </div>

                    {/* Filtres et Bouton Publier */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label htmlFor="teacher-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaChalkboardTeacher className="inline-block mr-2 text-teal-600" /> Enseignant
                                </label>
                                <select
                                    id="teacher-filter"
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0694A2] focus:border-transparent bg-teal-50 text-teal-700"
                                >
                                    {filterTeachers.map(teacherName => (
                                        <option key={teacherName} value={teacherName}>{teacherName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="room-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaDoorOpen className="inline-block mr-2 text-teal-600" /> Salle
                                </label>
                                <select
                                    id="room-filter"
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0694A2] focus:border-transparent bg-teal-50 text-teal-700"
                                >
                                    {filterRooms.map(roomName => (
                                        <option key={roomName} value={roomName}>{roomName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaBook className="inline-block mr-2 text-teal-600" /> Cours
                                </label>
                                <select
                                    id="course-filter"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0694A2] focus:border-transparent bg-teal-50 text-teal-700"
                                >
                                    {filterCourses.map(courseName => (
                                        <option key={courseName} value={courseName}>{courseName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end md:justify-start">
                                <button
                                    onClick={handlePublish}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                                    disabled={loadingSessions}
                                >
                                    {loadingSessions ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                                    Publier l'EDT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="h-[700px] md:h-[800px] lg:h-[900px]">
                        <DragAndDropCalendar
                            localizer={localizer}
                            events={filteredEvents}
                            startAccessor="start"
                            endAccessor="end"
                            culture='fr'
                            firstDayOfWeek={1}
                            style={{ height: '100vh' }}
                            eventPropGetter={eventStyleGetter}
                            components={{
                                event: EventComponent
                            }}
                            views={['week']}
                            defaultView="week"
                            date={defaultCalendarDate}
                            toolbar={false}
                            step={30}
                            timeslots={2}
                            showMultiDayTimes
                            min={new Date(2023, 0, 1, 7, 0)}
                            max={new Date(2023, 0, 1, 22, 0)}
                            formats={{
                                timeGutterFormat: 'HH:mm',
                                eventTimeRangeFormat: ({ start, end }) =>
                                    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
                            }}
                            scrollToTime={false}
                            onEventDrop={onEventDrop}
                            onEventResize={onEventResize}
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            selectable
                            resizable
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
            </div>
        </div>
    );
};
export default ScheduleCalendar;
