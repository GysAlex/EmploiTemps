const formatFrenchDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Options pour le format français : jour en 2 chiffres, mois en toutes lettres, année en 4 chiffres
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
        console.error("Erreur lors du formatage de la date:", e, dateString);
        return dateString; // Retourne la date originale en cas d'erreur de formatage
    }
};

export default formatFrenchDate;