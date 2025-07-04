<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';


Route::get('/setRole', function(){
    // $user = User::find(1);
    
    // $user->roles()->attach(1);

    // echo 'done !';
});
