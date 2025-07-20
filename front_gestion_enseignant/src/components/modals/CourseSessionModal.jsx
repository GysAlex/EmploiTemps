import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaSpinner, FaSave, FaTimes, FaChalkboardTeacher, FaBook, FaDoorOpen, FaClock, FaCalendarAlt, FaEdit, FaInfoCircle } from 'react-icons/fa';

// Tableau de mappage des jours de la semaine (0 = Dimanche, 1 = Lundi, ...)
const frenchDaysOfWeek = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

// Nouveau mappage pour les numéros de jour de la semaine ISO (1 = Lundi, ..., 7 = Dimanche)
const frenchDayToIsoWeekday = {
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6,
    'dimanche': 7
};

/**
 * Composant de formulaire pour créer ou éditer une session de cours.
 * Ce composant est destiné à être utilisé à l'intérieur d'une modale gérée globalement.
 *
 * @param {object} props - Les props du composant.
 * @param {string} props.promotionId - L'ID de la promotion.
 * @param {string} props.weekId - L'ID de la semaine.
 * @param {string} props.timetableId - L'ID de l'emploi du temps (Timetable) auquel la session appartient.
 * @param {object} [props.initialData] - Données initiales de la session pour l'édition. (Formaté comme un événement react-big-calendar avec rawSessionData)
 * @param {object} [props.slotInfo] - Informations sur le créneau horaire sélectionné (start, end) pour la création.
 * @param {function} props.onSave - Fonction de rappel appelée après une "sauvegarde" réussie (met à jour l'état local du parent).
 * @param {function} props.onCancel - Fonction de rappel appelée lors de l'annulation (ferme la modale).
 * @param {Array<object>} props.teachers - Liste des enseignants disponibles (sera filtrée par le cours sélectionné).
 * @param {Array<object>} props.rooms - Liste des salles disponibles.
 * @param {Array<object>} props.courses - Liste des cours disponibles. Chaque objet course DOIT avoir une propriété 'user' (l'enseignant assigné).
 * @param {Array<object>} props.timeSlots - Liste des créneaux horaires disponibles.
 * @param {Array<object>} props.existingSessions - Liste de toutes les sessions existantes dans le calendrier (pour la validation des chevauchements).
 * @param {object} props.weekDetails - Détails de la semaine en cours, incluant start_date (pour la validation des chevauchements).
 */
const CourseSessionModal = ({ promotionId, weekId, timetableId, initialData, slotInfo, onSave, onCancel, teachers, rooms, courses, timeSlots, existingSessions, weekDetails }) => {
    console.log("--- CourseSessionModal: Début du rendu ---");
    console.log("CourseSessionModal: initialData reçues (props):", initialData);
    console.log("CourseSessionModal: initialData.id (directement):", initialData?.id); // ID de l'événement BigCalendar
    console.log("CourseSessionModal: initialData.rawSessionData (si existe):", initialData?.rawSessionData);
    console.log("CourseSessionModal: initialData.rawSessionData.id (si existe):", initialData?.rawSessionData?.id); // ID potentiellement null/undefined du rawSessionData

    // Déterminer les données de session réelles à utiliser pour l'état initial du formulaire
    let sessionDataForForm = null;

    if (initialData) {
        if (initialData.rawSessionData) {
            sessionDataForForm = initialData.rawSessionData;
            console.log("CourseSessionModal: initialData est un événement BigCalendar. Utilisation de initialData.rawSessionData.");
        } else {
            sessionDataForForm = initialData;
            console.log("CourseSessionModal: initialData est déjà l'objet session brut. Utilisation directe de initialData.");
        }
    }

    const initialFormData = sessionDataForForm ? {
        id: initialData?.id || sessionDataForForm.id || null, 
        course_id: sessionDataForForm.course_id || '',
        teacher_id: sessionDataForForm.teacher_id || '',
        room_id: sessionDataForForm.room_id || '',
        time_slot_id: sessionDataForForm.time_slot_id || '',
        duration_minutes: sessionDataForForm.duration_minutes || '',
        session_type: sessionDataForForm.session_type || '',
        notes: sessionDataForForm.notes || '',
    } : {
        id: null,
        course_id: '',
        teacher_id: '',
        room_id: '',
        time_slot_id: '',
        duration_minutes: '',
        session_type: '',
        notes: '',
    };

    console.log("CourseSessionModal: initialFormData (après logique d'initialisation):", initialFormData);
    console.log("CourseSessionModal: ID de initialFormData:", initialFormData.id);


    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [filteredTimeSlots, setFilteredTimeSlots] = useState([]); // Nouvel état pour les créneaux filtrés
    // Nous n'avons plus besoin de filteredTeachers car l'enseignant est directement lié au cours.
    // const [filteredTeachers, setFilteredTeachers] = useState(teachers); 

    // Effet pour filtrer les créneaux horaires par jour de la semaine et disponibilité
    useEffect(() => {
        let dayToFilterBy = null;
        let currentSelectedSlot = null;

        // 1. Prioriser le jour du créneau horaire actuellement sélectionné dans formData
        if (formData.time_slot_id) {
            currentSelectedSlot = timeSlots.find(ts => ts.id === parseInt(formData.time_slot_id));
            if (currentSelectedSlot) {
                dayToFilterBy = currentSelectedSlot.day_of_week.toLowerCase();
                console.log("CourseSessionModal: Filtrage basé sur formData.time_slot_id. Jour:", dayToFilterBy);
            }
        }

        // 2. Fallback sur slotInfo pour les nouvelles sessions si aucun time_slot_id n'est pré-sélectionné
        if (!dayToFilterBy && slotInfo) {
            const startDate = new Date(slotInfo.start);
            const selectedDayNumeric = startDate.getDay();
            dayToFilterBy = frenchDaysOfWeek[selectedDayNumeric];
            console.log("CourseSessionModal: Filtrage basé sur slotInfo. Jour:", dayToFilterBy);
        } 
        // 3. Fallback sur initialData pour les sessions existantes si aucun time_slot_id n'est pré-sélectionné
        else if (!dayToFilterBy && initialData && initialData.rawSessionData && initialData.rawSessionData.time_slot) {
            dayToFilterBy = initialData.rawSessionData.time_slot.day_of_week.toLowerCase();
            console.log("CourseSessionModal: Filtrage basé sur initialData.rawSessionData. Jour:", dayToFilterBy);
        }

        if (dayToFilterBy && timeSlots.length > 0) {
            // Identifier les time_slot_id déjà utilisés par d'autres sessions dans la même semaine
            const occupiedTimeSlotIds = existingSessions
                .filter(session => {
                    // Exclure la session en cours d'édition de la liste des sessions "occupées"
                    return session.id !== formData.id && // IMPORTANT: Exclure la session actuelle lors de l'édition
                           session.rawSessionData &&
                           session.rawSessionData.time_slot &&
                           session.rawSessionData.time_slot.week_id === weekDetails.week_id;
                })
                .map(session => session.rawSessionData.time_slot_id);

            console.log("CourseSessionModal: ID des créneaux horaires déjà occupés (excluant la session actuelle si en édition):", occupiedTimeSlotIds);

            const slotsForDeterminedDay = timeSlots.filter(ts =>
                ts.day_of_week.toLowerCase() === dayToFilterBy &&
                !occupiedTimeSlotIds.includes(ts.id) // Exclure les créneaux déjà occupés
            );
            setFilteredTimeSlots(slotsForDeterminedDay);
            console.log("CourseSessionModal: Créneaux filtrés pour le jour", dayToFilterBy, "et disponibles:", slotsForDeterminedDay);

            // Si le time_slot_id actuel n'est plus dans la liste filtrée (parce qu'il est occupé par une autre session
            // ou que le jour a changé), réinitialiser le champ.
            // Sauf si le time_slot_id actuel est celui de la session en cours d'édition
            // et qu'il a été exclu car il est dans occupiedTimeSlotIds (ce qui ne devrait pas arriver avec la logique ci-dessus)
            // La condition `!slotsForDeterminedDay.some(ts => ts.id === parseInt(formData.time_slot_id))` est suffisante.
            if (formData.time_slot_id && !slotsForDeterminedDay.some(ts => ts.id === parseInt(formData.time_slot_id))) {
                console.log("CourseSessionModal: Le time_slot_id actuel n'est pas dans les créneaux filtrés. Réinitialisation.");
                setFormData(prev => ({ ...prev, time_slot_id: '' }));
            }
            
        } else {
            // Si aucun jour spécifique ne peut être déterminé ou si timeSlots ne sont pas encore chargés,
            // afficher tous les créneaux non occupés (si existingSessions est disponible).
            const occupiedTimeSlotIds = existingSessions
                .filter(session => {
                    return session.id !== formData.id && // IMPORTANT: Exclure la session actuelle lors de l'édition
                           session.rawSessionData &&
                           session.rawSessionData.time_slot &&
                           session.rawSessionData.time_slot.week_id === weekDetails.week_id;
                })
                .map(session => session.rawSessionData.time_slot_id);

            setFilteredTimeSlots(timeSlots.filter(ts => !occupiedTimeSlotIds.includes(ts.id)));
            console.log("CourseSessionModal: Affichage de tous les créneaux horaires non occupés.");
        }
    }, [slotInfo, timeSlots, initialData, formData.time_slot_id, existingSessions, weekDetails]);


    // Effet pour définir automatiquement l'enseignant lorsque le cours est sélectionné
    useEffect(() => {
        if (formData.course_id) {
            const selectedCourse = courses.find(course => course.id === parseInt(formData.course_id));
            if (selectedCourse && selectedCourse.user) { // Assurez-vous que le cours et son utilisateur (enseignant) existent
                setFormData(prev => ({ ...prev, teacher_id: selectedCourse.user.id.toString() }));
            } else {
                // Si le cours sélectionné n'a pas d'enseignant assigné, ou si le cours n'est pas trouvé
                setFormData(prev => ({ ...prev, teacher_id: '' }));
            }
        } else {
            // Si aucun cours n'est sélectionné, vider le champ enseignant
            setFormData(prev => ({ ...prev, teacher_id: '' }));
        }
    }, [formData.course_id, courses]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Efface l'erreur pour ce champ dès que l'utilisateur commence à taper/changer
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.course_id) newErrors.course_id = "Le cours est requis.";
        if (!formData.teacher_id) newErrors.teacher_id = "L'enseignant est requis.";
        if (!formData.room_id) newErrors.room_id = "La salle est requise.";
        if (!formData.time_slot_id) newErrors.time_slot_id = "Le créneau horaire est requis.";
        if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) newErrors.duration_minutes = "La durée doit être un nombre positif.";
        if (!formData.session_type) newErrors.session_type = "Le type de session est requis.";
        
        // --- Validation des chevauchements (CODE SUPPRIMÉ) ---
        // Le code de validation des chevauchements a été supprimé ici.
        // --- Fin Validation des chevauchements ---

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const sessionDataToSave = {
                id: formData.id,
                timetable_id: timetableId,
                course_id: parseInt(formData.course_id),
                teacher_id: parseInt(formData.teacher_id),
                room_id: parseInt(formData.room_id),
                time_slot_id: parseInt(formData.time_slot_id),
                duration_minutes: parseInt(formData.duration_minutes),
                session_type: formData.session_type,
                notes: formData.notes,
            };

            onSave(sessionDataToSave);

        } catch (err) {
            console.error("Erreur lors de la soumission du formulaire:", err);
            setApiError("Une erreur est survenue lors de l'enregistrement de la session.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Trouver l'enseignant sélectionné pour l'affichage
    const selectedTeacher = teachers.find(t => t.id === parseInt(formData.teacher_id));

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-[500px] flex flex-col max-h-[95vh] overflow-y-auto my-auto items-stretch gap-6 md:w-[70%] w-[80%] bg-white p-4 rounded-xl"
            style={{ boxShadow: "1px 5px 10px rgba(0, 0, 0, .2)" }}
        >
            <div className="my-4 flex items-center justify-between">
                <span className="text-teal-700 text-lg font-semibold">{initialData ? 'Modifier la Session de Cours' : 'Nouvelle Session de Cours'}</span>
                <button
                    onClick={onCancel}
                    type="button"
                    className="cursor-pointer p-2 rounded-full bg-teal-100 size-[30px] flex items-center justify-center"
                >
                    <i className="fa-solid fa-x text-sm text-teal-800"></i>
                </button>
            </div>

            <div className="space-y-6">
                {apiError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{apiError}</span>
                    </div>
                )}
                {/* Suppression de l'affichage de l'erreur de chevauchement */}
                {/* {errors.overlap && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{errors.overlap}</span>
                    </div>
                )} */}

                {/* Champ Cours */}
                <div>
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaBook className="inline-block mr-2 text-teal-600" /> Cours
                    </label>
                    <select
                        id="course_id"
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.course_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } bg-teal-50 text-teal-700`}
                        required
                    >
                        <option value="">Sélectionner un cours</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                    {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
                </div>

                {/* Champ Enseignant (maintenant en lecture seule) */}
                <div>
                    <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaChalkboardTeacher className="inline-block mr-2 text-teal-600" /> Enseignant
                    </label>
                    <input
                        type="text"
                        id="teacher_name" // Utilisez un ID différent pour l'input text
                        name="teacher_name"
                        value={selectedTeacher ? selectedTeacher.name : 'Sélectionnez un cours'}
                        readOnly // Rendre le champ en lecture seule
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.teacher_id ? 'border-red-500' : 'border-gray-300'
                        } bg-gray-100 text-gray-700 cursor-not-allowed`}
                    />
                    {errors.teacher_id && <p className="text-red-500 text-xs mt-1">{errors.teacher_id}</p>}
                </div>

                {/* Champ Salle */}
                <div>
                    <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaDoorOpen className="inline-block mr-2 text-teal-600" /> Salle
                    </label>
                    <select
                        id="room_id"
                        name="room_id"
                        value={formData.room_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.room_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } bg-teal-50 text-teal-700`}
                        required
                    >
                        <option value="">Sélectionner une salle</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                    {errors.room_id && <p className="text-red-500 text-xs mt-1">{errors.room_id}</p>}
                </div>

                {/* Champ Créneau Horaire */}
                <div>
                    <label htmlFor="time_slot_id" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaClock className="inline-block mr-2 text-teal-600" /> Créneau Horaire
                    </label>
                    <select
                        id="time_slot_id"
                        name="time_slot_id"
                        value={formData.time_slot_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.time_slot_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } bg-teal-50 text-teal-700`}
                        required
                    >
                        <option value="">Sélectionner un créneau</option>
                        {/* Utilise les créneaux horaires filtrés */}
                        {filteredTimeSlots.map(slot => (
                            <option key={slot.id} value={slot.id}>
                                {frenchDaysOfWeek[new Date(slot.day_of_week + 'T00:00:00').getDay()]} {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </option>
                        ))}
                    </select>
                    {errors.time_slot_id && <p className="text-red-500 text-xs mt-1">{errors.time_slot_id}</p>}
                </div>

                {/* Champ Durée */}
                <div>
                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt className="inline-block mr-2 text-teal-600" /> Durée (minutes)
                    </label>
                    <input
                        type="number"
                        id="duration_minutes"
                        name="duration_minutes"
                        value={formData.duration_minutes}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.duration_minutes ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } bg-teal-50 text-teal-700`}
                        min="1"
                        required
                    />
                    {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes}</p>}
                </div>

                {/* Champ Type de Session */}
                <div>
                    <label htmlFor="session_type" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaEdit className="inline-block mr-2 text-teal-600" /> Type de Session
                    </label>
                    <select
                        id="session_type"
                        name="session_type"
                        value={formData.session_type}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.session_type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } bg-teal-50 text-teal-700`}
                        required
                    >
                        <option value="">Sélectionner un type</option>
                        <option value="Cours Magistral">Cours Magistral</option>
                        <option value="Travaux Dirigés">Travaux Dirigés</option>
                        <option value="Travaux Pratiques">Travaux Pratiques</option>
                        <option value="Examen">Examen</option>
                    </select>
                    {errors.session_type && <p className="text-red-500 text-xs mt-1">{errors.session_type}</p>}
                </div>

                {/* Champ Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        <FaInfoCircle className="inline-block mr-2 text-teal-600" /> Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-teal-50 text-teal-700"
                    ></textarea>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex text-sm justify-start space-x-3">
                <button
                    type="submit"
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer')}
                </button>

                <button
                    onClick={onCancel}
                    type="button"
                    className="px-3 py-2 rounded-md text-gray-700 bg-red-100 hover:bg-red-300 transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
};

export default CourseSessionModal;
