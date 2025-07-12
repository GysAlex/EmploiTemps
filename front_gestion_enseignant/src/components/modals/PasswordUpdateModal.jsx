// components/PasswordUpdateModal.jsx
import React, { useState, useEffect } from 'react'
import { useModal } from '../../hooks/useModal'
import { useUser } from '../../hooks/useUser'

export function PasswordUpdateModal({ userData }) {
    const { closeModal } = useModal()
    const { updateUserPassword } = useUser()

    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [passwordMatchError, setPasswordMatchError] = useState('')

    // États pour afficher/masquer les mots de passe
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Effet pour la validation en temps réel : vérifie si les nouveaux mots de passe correspondent
    useEffect(() => {
        // Ne valider que si les deux champs de nouveau mot de passe sont remplis
        if (formData.password && formData.password_confirmation) {
            if (formData.password !== formData.password_confirmation) {
                setPasswordMatchError('Les nouveaux mots de passe ne correspondent pas.');
            } else {
                setPasswordMatchError(''); // Effacer l'erreur si ça correspond
            }
        } else {
            setPasswordMatchError(''); // Effacer l'erreur si un des champs est vide
        }
    }, [formData.password, formData.password_confirmation]); // Dépendances: les deux champs de nouveau mot de passe

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Effacer l'erreur du backend pour le champ spécifique quand l'utilisateur tape
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setValidationErrors({}); // Effacer les erreurs précédentes du backend
        setPasswordMatchError(''); // Effacer l'erreur de correspondance locale

        // Valider la correspondance des mots de passe avant d'envoyer au backend
        if (formData.password !== formData.password_confirmation) {
            setPasswordMatchError('Les nouveaux mots de passe ne correspondent pas.');
            setIsSaving(false);
            return; // Arrêter la soumission
        }

        try {
            await updateUserPassword(userData.id, formData);
            closeModal(); // Fermer en cas de succès
        } catch (error) {
            // Vérifier si l'erreur vient du backend avec des erreurs de validation
            if (error.response && error.response.data && error.response.data.errors) {
                setValidationErrors(error.response.data.errors);
            }
            console.error("Échec de la mise à jour du mot de passe :", error);
            // toast.promise gère déjà le message utilisateur
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-[500px] flex flex-col my-auto items-stretch gap-6 md:w-[70%] w-[80%] bg-white p-4 rounded-xl"
            style={{ boxShadow: "1px 5px 10px rgba(0, 0, 0, .2)" }}
        >
            <div className="my-4 flex items-center justify-between">
                <span className="text-teal-700 text-lg font-semibold">Mettre à jour le mot de passe</span>
                <button
                    onClick={closeModal}
                    type="button"
                    className="cursor-pointer p-2 rounded-full bg-teal-100 size-[30px] flex items-center justify-center"
                >
                    <i className="fa-solid fa-x text-sm text-teal-800"></i>
                </button>
            </div>

            <div className="space-y-4">
                {/* Champ Ancien mot de passe */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-lock w-4 h-4 mr-2 text-teal-600"></i>
                        Mot de passe actuel
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                validationErrors.current_password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                            }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        >
                            <i className={showCurrentPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                    </div>
                    {validationErrors.current_password && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.current_password[0]}</p>
                    )}
                </div>

                {/* Champ Nouveau mot de passe */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-key w-4 h-4 mr-2 text-teal-600"></i>
                        Nouveau mot de passe
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                validationErrors.password || passwordMatchError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                            }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        >
                            <i className={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                    </div>
                    {validationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.password[0]}</p>
                    )}
                </div>

                {/* Champ Confirmer nouveau mot de passe */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <i className="fas fa-check-circle w-4 h-4 mr-2 text-teal-600"></i>
                        Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                validationErrors.password_confirmation || passwordMatchError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                            }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        >
                            <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                    </div>
                    {validationErrors.password_confirmation && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.password_confirmation[0]}</p>
                    )}
                    {passwordMatchError && (
                        <p className="text-red-500 text-xs mt-1">{passwordMatchError}</p>
                    )}
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-4 flex text-sm justify-start space-x-3">
                <button
                    type="submit"
                    className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    // Désactiver si en cours de sauvegarde OU si les mots de passe ne correspondent pas
                    disabled={isSaving || !!passwordMatchError}
                >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
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