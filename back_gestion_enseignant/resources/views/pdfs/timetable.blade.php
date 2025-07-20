<!DOCTYPE html>
<html>
<head>
    <title>Emploi du temps - Promotion {{ $promotion->name }}</title>
    <meta charset="utf-8">
    <style>
        /* Styles CSS pour le PDF */
        body {
            font-family: 'DejaVu Sans', sans-serif; /* Important pour les caractères spéciaux (accents) */
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px; /* Ajout d'un padding global pour le corps du document */
        }

        /* Tableau principal du header */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .header-table td {
            vertical-align: top; /* Aligner le contenu en haut de chaque cellule */
            padding: 0 5px; /* Petit padding pour espacer le contenu */
            font-size: 8px;
            color: #555;
            border: none;
            text-align: center;
            line-height: 1.5;
        }

        .header-left-content {
            width: 40%;
            text-align: left;
        }

        .header-center-content {
            width: 20%;
            text-align: center;
        }

        .header-right-content {
            width: 40%;
            text-align: right;
        }

        .header-table p {
            margin: 4px 0;
            padding: 0;
            line-height: 1.2;
        }
        .header-table .republique {
            font-weight: bold;
            font-size: 9px;
        }
        .header-center-content img {
            max-width: 80px;
            max-height: 80px;
            display: block; /* S'assurer que l'image est un bloc pour centrage */
            margin: 0 auto; /* Centrer l'image */
        }
        .divider {
            margin: 3px 0; /* Ajuster les marges pour les dividers */
            width: 60px; /* Augmenter la largeur du divider pour une meilleure visibilité */
            border-top: 1px solid #aaa;
            display: none;
        }
        .main-title-section {
            margin-bottom: 20px;
        }
        h1 {
            text-align: center;
            color: #0694A2;
            font-size: 18px;
            margin-bottom: 5px;
        }
        h2 {
            text-align: center;
            color: #0694A2;
            font-size: 14px;
            margin-bottom: 5px;
        }
        h3 {
            text-align: center;
            color: #555;
            font-size: 12px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #555;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 8px;
            color: #777;
        }
        .session-type {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
            margin-top: 2px;
        }
        .session-type-cm { background-color: #14B8A6; } /* Teal */
        .session-type-tp { background-color: #F59E0B; } /* Orange */
        .session-type-td { background-color: #3B82F6; } /* Blue */
        .session-type-examen { background-color: #EF4444; } /* Red */
        .session-details {
            font-size: 0.9em;
            line-height: 1.2;
        }
        .session-details strong {
            display: block;
        }
        .session-details span {
            display: block;
            font-size: 0.8em;
            color: #666;
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td class="header-left-content">
                <p class="republique">REPUBLIQUE DU CAMEROUN</p>
                <p>Paix – Travail – Patrie</p>
                <div class="divider"></div>
                <p>MINISTERE DE L'ENSEIGNEMENT SUPERIEUR</p>
                <p>UNIVERSITE DE DOUALA</p>
                <p>INSTITUT UNIVERSITAIRE DE TECHNOLOGIE</p>
            </td>
            <td class="header-center-content">
                <img src="data:image/jpeg;base64,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" alt="Logo Université">
            </td>
            <td class="header-right-content">
                <p class="republique">REPUBLIC OF CAMEROON</p>
                <p>Peace – Work – Fatherland</p>
                <div class="divider"></div>
                <p>MINISTRY OF HIGHER EDUCATION</p>
                <p>THE UNIVERSITY OF DOUALA</p>
                <p>UNIVERSITY INSTITUTE OF TECHNOLOGY</p>
            </td>
        </tr>
    </table>

    <div class="main-title-section">
        <h1>Emploi du temps hebdomadaire</h1>
        <h2>Promotion {{ $promotion->name }} ({{ $promotion->level }})</h2>
        <h3>Semaine {{ $timetable->week->week_id }} : du {{ \Carbon\Carbon::parse($timetable->week->start_date)->locale('fr')->isoFormat('dddd Do MMMM YYYY') }} au {{ \Carbon\Carbon::parse($timetable->week->end_date)->locale('fr')->isoFormat('dddd Do MMMM YYYY') }}</h3>
    </div>

    @if($timetable->courseSessions->isEmpty())
        <p style="text-align: center; margin-top: 50px;">Aucune session de cours définie pour cette semaine.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Jour</th>
                    <th>Heure</th>
                    <th>Cours et Détails</th>
                    <th>Salle</th>
                    <th>Type</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @php
                    // Regrouper les sessions par jour de la semaine
                    $sessionsByDay = $timetable->courseSessions->groupBy(function($session) {
                        // Utilise le jour de la semaine du timeSlot, converti en minuscule pour le mappage
                        return strtolower($session->timeSlot->day_of_week);
                    })->sortBy(function ($sessions, $day) {
                        // Ordre des jours de la semaine (pour trier)
                        $order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        return array_search($day, $order);
                    });
                @endphp

                @foreach($sessionsByDay as $dayKey => $sessions)
                    @php
                        // Convertir la clé du jour en nom français pour l'affichage
                        $frenchDayNames = [
                            'monday' => 'Lundi',
                            'tuesday' => 'Mardi',
                            'wednesday' => 'Mercredi',
                            'thursday' => 'Jeudi',
                            'friday' => 'Vendredi',
                            'saturday' => 'Samedi',
                            'sunday' => 'Dimanche',
                        ];
                        $displayDay = $frenchDayNames[$dayKey] ?? ucfirst($dayKey);
                        $firstRow = true;
                    @endphp
                    @foreach($sessions->sortBy('timeSlot.start_time') as $session)
                        <tr>
                            <td>
                                @if($firstRow)
                                    <strong>{{ $displayDay }}</strong>
                                    @php $firstRow = false; @endphp
                                @endif
                            </td>
                            <td>
                                {{ \Carbon\Carbon::parse($session->timeSlot->start_time)->format('H:i') }} -
                                {{ \Carbon\Carbon::parse($session->timeSlot->start_time)->addMinutes($session->duration_minutes)->format('H:i') }}
                            </td>
                            <td>
                                <div class="session-details">
                                    <strong>{{ $session->course->name ?? 'N/A' }}</strong>
                                    <span>{{ $session->teacher->name ?? 'N/A' }}</span>
                                </div>
                            </td>
                            <td>{{ $session->classroom->name ?? 'N/A' }}</td>
                            <td>
                                @php
                                    $typeClass = '';
                                    switch ($session->session_type) {
                                        case 'Cours Magistral': $typeClass = 'session-type-cm'; break;
                                        case 'Travaux Pratiques': $typeClass = 'session-type-tp'; break;
                                        case 'Travaux Dirigés': $typeClass = 'session-type-td'; break;
                                        case 'Examen': $typeClass = 'session-type-examen'; break;
                                    }
                                @endphp
                                <span class="session-type {{ $typeClass }}">{{ $session->session_type }}</span>
                            </td>
                            <td>{{ $session->notes ?? '' }}</td>
                        </tr>
                    @endforeach
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        Généré le {{ date('d/m/Y H:i') }} par {{ config('app.name') }}
    </div>
</body>
</html>
