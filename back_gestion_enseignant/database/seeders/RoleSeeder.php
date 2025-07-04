<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(['name' => 'super_admin', 'description' => 'Administrateur système avec tous les droits']);
        Role::create(['name' => 'admin', 'description' => 'Administrateur avec des droits limités']);
        Role::create(['name' => 'teacher', 'description' => 'Enseignant']);
    }
}
