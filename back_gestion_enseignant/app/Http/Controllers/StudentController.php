<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Display a listing of the students for a specific promotion.
     *
     * @param  int  $promotionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(int $promotionId)
    {
        $promotion = Promotion::find($promotionId);

        if (!$promotion) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        }

        $students = $promotion->students()->latest()->get();

        return response()->json([
            'data' => $students,
            'message' => 'Étudiants récupérés avec succès pour la promotion.'
        ], 200);
    }

    /**
     * Store a newly created student in storage for a specific promotion.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $promotionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, int $promotionId)
    {
        try {
            $promotion = Promotion::find($promotionId);

            if (!$promotion) {
                return response()->json(['message' => 'Promotion non trouvée.'], 404);
            }

            $messages = [
                'full_name.required' => 'Le nom complet de l\'étudiant est obligatoire.',
                'full_name.string' => 'Le nom complet doit être une chaîne de caractères.',
                'full_name.max' => 'Le nom complet ne doit pas dépasser :max caractères.',
                'email.required' => 'L\'adresse email est obligatoire.',
                'email.email' => 'L\'adresse email doit être valide.',
                'email.unique' => 'Cet email est déjà utilisé par un autre étudiant.',
                'matricule.required' => 'Le numéro de matricule est obligatoire.',
                'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
                'matricule.unique' => 'Ce numéro de matricule est déjà utilisé par un autre étudiant.',
            ];

            $validatedData = $request->validate([
                'full_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:students'],
                'matricule' => ['required', 'string', 'max:255', 'unique:students'],
            ], $messages);

            $validatedData['is_delegate'] = false;

            $student = $promotion->students()->create($validatedData);

            return response()->json([
                'data' => $student,
                'message' => 'Étudiant créé avec succès.'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreurs de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de l\'étudiant.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified student.
     *
     * @param  int  $promotionId
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $promotionId, Student $student)
    {
        if ($student->promotion_id != $promotionId) {
            return response()->json(['message' => 'Étudiant non trouvé dans cette promotion.'], 404);
        }

        return response()->json([
            'data' => $student,
            'message' => 'Étudiant récupéré avec succès.'
        ], 200);
    }

    /**
     * Update the specified student in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $promotionId
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $promotionId, Student $student)
    {
        try {
            if ($student->promotion_id != $promotionId) {
                return response()->json(['message' => 'Étudiant non trouvé dans cette promotion.'], 404);
            }

            $messages = [
                'full_name.required' => 'Le nom complet de l\'étudiant est obligatoire.',
                'full_name.string' => 'Le nom complet doit être une chaîne de caractères.',
                'full_name.max' => 'Le nom complet ne doit pas dépasser :max caractères.',
                'email.required' => 'L\'adresse email est obligatoire.',
                'email.email' => 'L\'adresse email doit être valide.',
                'email.unique' => 'Cet email est déjà utilisé par un autre étudiant.',
                'matricule.required' => 'Le numéro de matricule est obligatoire.',
                'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
                'matricule.unique' => 'Ce numéro de matricule est déjà utilisé par un autre étudiant.',
                'is_delegate.boolean' => 'Le statut de délégué doit être vrai ou faux.',
            ];

            $validatedData = $request->validate([
                'full_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('students')->ignore($student->id)],
                'matricule' => ['required', 'string', 'max:255', Rule::unique('students')->ignore($student->id)],
                'is_delegate' => ['boolean'],
            ], $messages);

            if (isset($validatedData['is_delegate']) && $validatedData['is_delegate']) {
                $student->promotion->students()->where('is_delegate', true)->where('id', '!=', $student->id)->update(['is_delegate' => false]);
            }

            $student->update($validatedData);

            return response()->json([
                'data' => $student,
                'message' => 'Étudiant mis à jour avec succès.'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreurs de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'étudiant.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student from storage.
     *
     * @param  int  $promotionId
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $promotionId, Student $student)
    {
        if ($student->promotion_id != $promotionId) {
            return response()->json(['message' => 'Étudiant non trouvé dans cette promotion.'], 404);
        }

        try {
            $student->delete();
            return response()->json(['message' => 'Étudiant supprimé avec succès.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'étudiant.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set the delegate status for a specific student.
     * This method ensures only one student per promotion can be a delegate.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $promotionId
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\JsonResponse
     */
    public function setDelegateStatus(Request $request, int $promotionId, Student $student)
    {
        try {
            if ($student->promotion_id != $promotionId) {
                return response()->json(['message' => 'Étudiant non trouvé dans cette promotion.'], 404);
            }

            $validatedData = $request->validate([
                'is_delegate' => ['required', 'boolean'],
            ]);

            $newStatus = $validatedData['is_delegate'];

            if ($newStatus) {
                $student->promotion->students()->where('is_delegate', true)->where('id', '!=', $student->id)->update(['is_delegate' => false]);
            }

            $student->update(['is_delegate' => $newStatus]);

            return response()->json([
                'data' => $student,
                'message' => 'Statut de délégué mis à jour avec succès.'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut de délégué.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import students from a file (e.g., CSV).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $promotionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function importStudents(Request $request, int $promotionId)
    {
        try {
            $promotion = Promotion::find($promotionId);

            if (!$promotion) {
                return response()->json(['message' => 'Promotion non trouvée.'], 404);
            }

            $request->validate([
                'file' => [
                    'required',
                    'file',
                    'mimes:csv,txt,xlsx',
                    'max:2048',
                ],
            ], [
                'file.required' => 'Veuillez télécharger un fichier.',
                'file.file' => 'Le fichier téléchargé n\'est pas valide.',
                'file.mimes' => 'Le fichier doit être de type CSV, TXT ou XLSX.',
                'file.max' => 'Le fichier ne doit pas dépasser 2 Mo.',
            ]);

            $file = $request->file('file');
            $filePath = $file->getPathname();
            $extension = $file->getClientOriginalExtension();

            $successCount = 0;
            $failureCount = 0;
            $failedRows = [];

            DB::beginTransaction();

            if ($extension === 'csv' || $extension === 'txt') {
                if (($handle = fopen($filePath, 'r')) !== FALSE) {
                    $header = fgetcsv($handle, 1000, ',');
                    $expectedHeaders = ['full_name', 'email', 'matricule'];

                    if (count(array_intersect($header, $expectedHeaders)) !== count($expectedHeaders)) {
                        fclose($handle);
                        DB::rollBack();
                        return response()->json(['message' => 'Les en-têtes du fichier CSV sont invalides. Attendu: ' . implode(', ', $expectedHeaders)], 422);
                    }

                    $rowIndex = 1;
                    while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
                        $rowIndex++;
                        if (empty(array_filter($data, 'strlen'))) {
                            continue;
                        }

                        $rowData = array_combine($header, $data);

                        $studentData = [
                            'full_name' => $rowData['full_name'] ?? null,
                            'email' => $rowData['email'] ?? null,
                            'matricule' => $rowData['matricule'] ?? null,
                            'is_delegate' => false,
                            'promotion_id' => $promotionId,
                        ];

                        $validator = Validator::make($studentData, [
                            'full_name' => ['required', 'string', 'max:255'],
                            'email' => ['required', 'string', 'email', 'max:255', 'unique:students,email'],
                            'matricule' => ['required', 'string', 'max:255', 'unique:students,matricule'],
                        ], [
                            'full_name.required' => 'Nom complet manquant.',
                            'email.required' => 'Email manquant.',
                            'email.email' => 'Format d\'email invalide.',
                            'email.unique' => 'Email déjà utilisé.',
                            'matricule.required' => 'Matricule manquant.',
                            'matricule.unique' => 'Matricule déjà utilisé.',
                        ]);

                        if ($validator->fails()) {
                            $failureCount++;
                            $failedRows[] = [
                                'row' => $rowIndex,
                                'data' => $rowData,
                                'errors' => $validator->errors()->all(),
                            ];
                        } else {
                            try {
                                $promotion->students()->create($studentData);
                                $successCount++;
                            } catch (\Exception $e) {
                                $failureCount++;
                                $failedRows[] = [
                                    'row' => $rowIndex,
                                    'data' => $rowData,
                                    'errors' => ['Erreur d\'enregistrement en base de données: ' . $e->getMessage()],
                                ];
                                Log::error("Erreur d'importation étudiant (ligne $rowIndex): " . $e->getMessage());
                            }
                        }
                    }
                    fclose($handle);
                } else {
                    DB::rollBack();
                    return response()->json(['message' => 'Impossible d\'ouvrir le fichier CSV.'], 500);
                }
            } elseif ($extension === 'xlsx') {
                DB::rollBack();
                return response()->json(['message' => 'L\'importation de fichiers XLSX nécessite une bibliothèque supplémentaire (ex: Maatwebsite/Excel) non implémentée dans cet exemple.'], 501);
            } else {
                DB::rollBack();
                return response()->json(['message' => 'Type de fichier non supporté.'], 422);
            }

            if ($failureCount > 0) {
                DB::rollBack();
                return response()->json([
                    'message' => "Importation terminée avec des erreurs. {$successCount} étudiants importés, {$failureCount} échecs.",
                    'success_count' => $successCount,
                    'failure_count' => $failureCount,
                    'failed_rows' => $failedRows,
                ], 422);
            }

            DB::commit();

            return response()->json([
                'message' => 'Importation des étudiants réussie !',
                'success_count' => $successCount,
                'failure_count' => $failureCount,
            ], 200);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur de validation du fichier.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de l\'importation des étudiants : ' . $e->getMessage());
            return response()->json(['message' => 'Une erreur inattendue est survenue lors de l\'importation des étudiants.'], 500);
        }
    }

    /**
     * Download the list of students for a specific promotion as a PDF.
     *
     * @param  int  $promotionId
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function downloadPdf(int $promotionId)
    {
        try {
            $promotion = Promotion::find($promotionId);

            if (!$promotion) {
                return response()->json(['message' => 'Promotion non trouvée.'], 404);
            }

            $students = $promotion->students()->latest()->get();

            // Charger la vue Blade avec les données et générer le PDF
            $pdf = Pdf::loadView('pdfs.students_list', compact('promotion', 'students'));

            // Retourner le PDF en téléchargement
            return $pdf->download('liste_etudiants_' . Str::slug($promotion->name) . '.pdf');

        } catch (\Exception $e) {
            Log::error('Erreur lors de la génération du PDF des étudiants : ' . $e->getMessage());
            return response()->json(['message' => 'Une erreur est survenue lors de la génération du PDF.', 'error' => $e->getMessage()], 500);
        }
    }
}
