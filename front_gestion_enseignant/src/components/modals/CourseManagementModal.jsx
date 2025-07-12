// src/components/CourseManagement/CourseManagementModal.jsx
import React, { useEffect, useState, useMemo } from "react"; // Importez useMemo
import { useModal } from "../../hooks/useModal";
import { useCourses } from "../../hooks/useCourses";
import { useManageUser } from "../../hooks/useManageUser";

export function CourseManagementModal({ courseData }) {
    const { closeModal } = useModal();
    const { createCourse, updateCourse, isSaving, validationErrors, setValidationErrors } = useCourses();
    const { users, fetchUsers } = useManageUser();

    const isCreating = !courseData;

    const availableLevels = ["Niveau 1", "Niveau 2", "Niveau 3", "Niveau 4", "Niveau 5"];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        user_id: '', // Utilisé user_id
        level: availableLevels[0],
    });

    // --- CHANGEMENT CLÉ ICI : Mémoïser availableTeachers avec useMemo
    const availableTeachers = useMemo(() => {
        return users.filter(user =>
            user.roles && user.roles.some(role => role.name === 'enseignant')
        );
    }, [users]); // availableTeachers ne change que si 'users' change

    // Premier useEffect: Charger les utilisateurs (enseignants)
    useEffect(() => {
        if (users.length === 0) {
            fetchUsers();
        }
    }, [fetchUsers, users.length]);

    // Deuxième useEffect: Initialiser formData et réinitialiser les erreurs
    useEffect(() => {
        if (courseData) {
            setFormData({
                name: courseData.name || '',
                description: courseData.description || '',
                user_id: courseData.user_id || '',
                level: courseData.level || availableLevels[0],
            });
        } else {
            setFormData({
                name: '',
                description: '',
                user_id: availableTeachers.length > 0 ? availableTeachers[0].id : '',
                level: availableLevels[0],
            });
        }
        // Réinitialiser les erreurs de validation lorsque les données du cours ou les enseignants disponibles changent
        setValidationErrors({});
    }, [courseData, availableTeachers, setValidationErrors]); // setValidationErrors comme dépendance est correct ici

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            const dataToSave = {
                ...formData,
                user_id: formData.user_id ? parseInt(formData.user_id, 10) : null,
            };

            if (isCreating) {
                await createCourse(dataToSave);
            } else {
                await updateCourse(courseData.id, dataToSave);
            }
            closeModal();
        } catch (error) {
            console.error("Erreur lors de la soumission du formulaire cours:", error);
            // La gestion des toasts et validationErrors est déjà dans le hook de contexte
        }
    };

    const modalTitle = isCreating ? "Ajouter un nouveau cours" : "Modifier le cours";

    return (
        <form
            className="max-w-[500px] flex flex-col max-h-[95vh] overflow-y-auto my-auto items-stretch gap-6 md:w-[70%] w-[80%] bg-white p-4 rounded-xl"
            style={{ boxShadow: "1px 5px 10px rgba(0, 0, 0, .2)" }}
            onSubmit={handleSubmit}
        >
            <div className="my-4 flex items-center justify-between">
                <span className="text-teal-700 text-lg font-semibold">{modalTitle}</span>
                <button
                    onClick={closeModal}
                    type="button"
                    className="cursor-pointer p-2 rounded-full bg-teal-100 size-[30px] flex items-center justify-center"
                >
                    <i className="fa-solid fa-x text-sm text-teal-800"></i>
                </button>
            </div>

            <div className="space-y-6">
                {/* Champ Nom du cours */}
                <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-book w-4 h-4 mr-2 text-teal-600"></i>
                        Nom du cours
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    />
                    {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name[0]}</p>
                    )}
                </div>

                {/* Champ Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-align-left w-4 h-4 mr-2 text-teal-600"></i>
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        
                    ></textarea>
                    {validationErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.description[0]}</p>
                    )}
                </div>

                {/* Champ Enseignant */}
                <div className="space-y-2">
                    <label htmlFor="user_id" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-chalkboard-teacher w-4 h-4 mr-2 text-teal-600"></i>
                        Enseignant
                    </label>
                    <select
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.user_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    >
                        <option value="">Sélectionner un enseignant</option>
                        {availableTeachers.length > 0 ? (
                            availableTeachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.email})
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Chargement des enseignants...</option>
                        )}
                    </select>
                    {validationErrors.user_id && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.user_id[0]}</p>
                    )}
                </div>

                {/* Champ Niveau */}
                <div className="space-y-2">
                    <label htmlFor="level" className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-graduation-cap w-4 h-4 mr-2 text-teal-600"></i>
                        Niveau
                    </label>
                    <select
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.level ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    >
                        {availableLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                    {validationErrors.level && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.level[0]}</p>
                    )}
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex text-sm justify-start space-x-3">
                <button
                    type="submit"
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                >
                    {isSaving ? 'Enregistrement...' : (isCreating ? 'Créer le cours' : 'Mettre à jour')}
                </button>

                <button
                    onClick={closeModal}
                    type="button"
                    className="px-3 py-2 rounded-md text-gray-700 bg-red-100 hover:bg-red-300 transition-colors duration-200"
                    disabled={isSaving}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}

CourseManagementModal.getAvailableLevels = () => ["Niveau 1", "Niveau 2", "Niveau 3", "Niveau 4", "Niveau 5"];