<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Liste des étudiants - Promotion {{ $promotion->name }}</title>
    <style>
        /* Styles CSS pour le PDF */
        body {
            font-family: "DejaVu Sans", sans-serif; /* Utiliser une police qui supporte les caractères spéciaux */
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            text-align: center;
            color: #0694A2;
            font-size: 20px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #777;
        }
        .delegate-badge {
            background-color: #fff3cd;
            color: #856404;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>Liste des étudiants - Promotion {{ $promotion->name }} ({{ $promotion->level }})</h1>

    <table>
        <thead>
            <tr>
                <th>Nom Complet</th>
                <th>Email</th>
                <th>Matricule</th>
                <th>Délégué</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($students as $student)
                <tr>
                    <td>{{ $student->full_name }}</td>
                    <td>{{ $student->email }}</td>
                    <td>{{ $student->matricule }}</td>
                    <td>
                        @if ($student->is_delegate)
                            <span class="delegate-badge">Oui</span>
                        @else
                            Non
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center;">Aucun étudiant trouvé pour cette promotion.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Généré le {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>
