<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Role;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';


Route::get('/setUser', function(){

    // $user = User::find(1);

    // $user->roles()->attach([1, 2]);

    // echo "done !";

});
