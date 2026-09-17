<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@katteyes.test');
        $name  = env('ADMIN_NAME', 'Store Admin');

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->password = Hash::make(env('ADMIN_PASSWORD', 'password'));
        $user->role = 'admin';
        $user->save();
    }
}