import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal"; // Assurez-vous que ce chemin est correct
import { useUser } from "../../hooks/useUser"; // Pour récupérer l'utilisateur connecté (pour les rôles)
import { useManageUser } from "../../hooks/useManageUser"; // Le nouveau hook

export function UserManagementModal({ userData }) {
    const { closeModal } = useModal();
    const { user: currentUser } = useUser(); // Utilisateur connecté pour les permissions

    // Utilisation du nouveau hook de gestion des utilisateurs
    const { createUser, updateUser, loading: isSaving, validationErrors, setValidationErrors, fetchUsers } = useManageUser();

    // Détermine si on est en mode "création" ou "mise à jour"
    const isCreating = !userData;

    // États du formulaire
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: isCreating ? '00000000' : '', // Mot de passe par défaut pour la création
    });
    const [selectedRoles, setSelectedRoles] = useState([]);

    // État pour afficher/masquer le mot de passe
    const [showPassword, setShowPassword] = useState(false);

    // Vérifie si l'utilisateur actuellement connecté peut éditer les rôles
    const canEditRoles = currentUser?.roles?.includes('super_admin');
    const availableRoles = ["super_admin", "admin", "enseignant"]; // Tous les rôles possibles

    // Effet pour initialiser le formulaire
    useEffect(() => {
        if (userData) {
            // Mode mise à jour
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                password: '', // Le mot de passe n'est pas pré-rempli pour la modification
            });
            setSelectedRoles(userData.roles.map((role) => role.name) || []);
        } else {
            // Mode création
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '00000000', // Valeur par défaut pour la création
            });
            setSelectedRoles([]); // Aucun rôle sélectionné par défaut
        }
        setValidationErrors({});
    }, [userData, setValidationErrors]); // Dépend de userData et setValidationErrors

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Effacer l'erreur de validation pour le champ quand il est modifié
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleRoleToggle = (roleToToggle) => {
        if (!canEditRoles) return; // Empêche le changement si l'utilisateur n'est pas super_admin

        setSelectedRoles(prevRoles => {
            if (prevRoles.includes(roleToToggle)) {
                return prevRoles.filter(role => role !== roleToToggle);
            } else {
                return [...prevRoles, roleToToggle];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setValidationErrors({});

        try {
            const dataToSave = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                // Le mot de passe est inclus seulement si c'est une création
                // ou si c'est une mise à jour ET que le champ n'est pas vide
                ...(isCreating || formData.password ? { password: formData.password } : {}),
                // Inclure les rôles uniquement si l'utilisateur connecté a le droit de les éditer
                ...(canEditRoles && { roles: selectedRoles }),
            };

            if (isCreating) {
                await createUser(dataToSave);
            } else {
                await updateUser(userData.id, dataToSave);
            }
            closeModal(); // Ferme le modal après un succès
        } catch (error) {
            // Les erreurs sont gérées par toast.promise dans useManageUser,
            // et les erreurs de validation sont mises à jour dans le state `validationErrors`
            console.error("Erreur lors de la soumission du formulaire utilisateur:", error);
        }
    };

    const modalTitle = isCreating ? "Créer un nouvel utilisateur" : "Mettre à jour l'utilisateur";

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
                {/* Champ Nom */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-user w-4 h-4 mr-2 text-teal-600"></i>
                        Nom
                    </label>
                    <input
                        type="text"
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

                {/* Champ Email */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-envelope w-4 h-4 mr-2 text-teal-600"></i>
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        required
                    />
                    {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email[0]}</p>
                    )}
                </div>

                {/* Champ Téléphone */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-phone w-4 h-4 mr-2 text-teal-600"></i>
                        Téléphone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            validationErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                    />
                    {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone[0]}</p>
                    )}
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-lock w-4 h-4 mr-2 text-teal-600"></i>
                        Mot de passe
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            readOnly={isCreating} // Lecture seule en mode création
                            required={isCreating} // Requis seulement en mode création
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                isCreating ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                            } ${
                                validationErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        >
                            <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                    </div>
                    {isCreating && (
                        <p className="text-gray-500 text-xs mt-1">
                            Le mot de passe par défaut est '00000000'. L'utilisateur pourra le modifier.
                        </p>
                    )}
                    {validationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.password[0]}</p>
                    )}
                </div>

                {/* Section Rôles */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-briefcase w-4 h-4 mr-2 text-teal-600"></i>
                        Rôles
                    </label>
                    {canEditRoles ? (
                        // Affichage des boutons pour l'édition des rôles (si super_admin)
                        <div className="flex flex-wrap gap-2 mt-1">
                            {availableRoles.map(role => (
                                <button
                                    key={role}
                                    type="button" // Important: type="button" pour éviter la soumission du formulaire
                                    onClick={() => handleRoleToggle(role)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                        ${selectedRoles.includes(role)
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Affichage simple des rôles (si pas super_admin)
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium cursor-not-allowed">
                            {selectedRoles.length > 0 ? selectedRoles.map(role => role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)).join(', ') : 'Aucun rôle'}
                        </div>
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
                    {isSaving ? 'Enregistrement...' : (isCreating ? 'Créer' : 'Mettre à jour')}
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