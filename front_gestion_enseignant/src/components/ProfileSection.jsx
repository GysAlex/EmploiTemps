import React, { useState, useRef } from 'react'
import { FaCamera } from 'react-icons/fa' // Importe l'icône de l'appareil photo
import { useUser } from '../hooks/useUser';

const ProfileSection = () => {
	const { user, loading, error, updateProfileImage } = useUser(); 

	const [previewImage, setPreviewImage] = useState(null);
	const [isEditing, setIsEditing] = useState(false);

	const fileInputRef = useRef(null);

	const handleCameraIconClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewImage(reader.result);
			setIsEditing(true);
		};
		reader.readAsDataURL(file);
		}
	};

	const handleSave = async () => {
		if (!fileInputRef.current || !fileInputRef.current.files[0]) {
		// Le toast.warning dans updateProfileImage gérera l'absence de fichier
		return; 
		}

		try {
		await updateProfileImage(fileInputRef.current.files[0]);
		// Si l'upload via le contexte réussit, réinitialiser les états locaux ici
		setPreviewImage(null);
		setIsEditing(false);
		fileInputRef.current.value = null; 
		} catch (err) {
		// Le toast d'erreur est géré par le contexte, ici on peut juste nettoyer l'état local
		// Ou ajouter une logique spécifique si le composant doit réagir différemment
		console.log("Upload échoué, toast affiché par le contexte.", err);
		// Optionnel: annuler la prévisualisation en cas d'échec
		handleCancel(); 
		}
	};

	const handleCancel = () => {
		setPreviewImage(null);
		setIsEditing(false);
		fileInputRef.current.value = null;
	};

	return (
		<div>
			<div className="h-20 sm:h-24 bg-gradient-to-r from-teal-400 to-teal-500 rounded-t-lg relative">
				<div className="absolute -bottom-8 left-6">
					<div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-white shadow-lg flex items-center justify-center overflow-hidden relative">
						<img
							// Affiche l'image de prévisualisation si disponible, sinon l'image de profil actuelle
							src={previewImage || user.profile_image}
							alt="Profile"
							className="w-full h-full  object-cover"
						/>
					</div>
					{/* Icône de l'appareil photo */}
					<div
						className="absolute -bottom-3.5 right-0 bg-teal-500 rounded-full p-1.5 cursor-pointer border border-white transform translate-x-1 translate-y-1 hover:bg-teal-600 transition-colors duration-200"
						onClick={handleCameraIconClick}
						title="Changer la photo de profil"
					>
						<FaCamera className="text-white relative text-sm sm:text-base" />
						{/* Input file masqué */}
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*" // N'accepte que les fichiers image
							onChange={handleFileChange}
						/>
					</div>
				</div>
			</div>

			{/* Boutons Modifier/Annuler, affichés uniquement en mode édition */}
			{isEditing && (
				<div className="mt-14  w-[95%] mx-auto flex justify-start space-x-4">
					<button
						onClick={handleSave}
						className="px-2 py-1 text-sm bg-green-300 text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-sm"
					>
						Modifier
					</button>
					<button
						onClick={handleCancel}
						className="px-2 py-1 text-sm bg-red-300 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm"
					>
						Annuler
					</button>
				</div>
			)}
		</div>
	)
}

export default ProfileSection;