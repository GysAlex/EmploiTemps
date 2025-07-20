@component('mail::message')
# 📅 Emploi du temps - Semaine {{ $weekId }}

Bonjour **{{ $delegateName ?? 'Délégué(e)' }}**,

Nous espérons que vous allez bien !

L'emploi du temps de la promotion **{{ $promotionName }}** pour la **Semaine {{ $weekId }}** ({{ $startDate }} - {{ $endDate }}) est désormais disponible.

@component('mail::panel')
📎 **Emploi du temps en pièce jointe**
Vous trouverez le planning détaillé au format PDF ci-joint.
@endcomponent

## 📋 Actions à effectuer

- ✅ Consulter l'emploi du temps
- ✅ Diffuser l'information auprès de vos étudiants
- ✅ Vérifier les éventuels changements par rapport à la semaine précédente

@component('mail::button', ['url' => $platformUrl ?? '#', 'color' => 'primary'])
Accéder à la plateforme
@endcomponent

---

💡 **Besoin d'aide ?**
Notre équipe reste à votre disposition pour toute question ou assistance.

@component('mail::subcopy')
Cet email a été envoyé automatiquement. Pour toute question, contactez l'administration académique.
@endcomponent

Excellente semaine à vous et à vos étudiants ! 🎓

**L'équipe {{ config('app.name') }}**
*Administration Académique*
@endcomponent
