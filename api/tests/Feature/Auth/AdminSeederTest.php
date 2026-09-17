<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_admin_user_with_correct_role(): void
    {
        $this->seed(AdminSeeder::class);

        $admin = User::where('email', 'admin@katteyes.test')->first();
        $this->assertNotNull($admin);
        $this->assertEquals('admin', $admin->role);
        $this->assertTrue(Hash::check('password', $admin->password));
    }

    public function test_seeder_is_idempotent_runs_twice_does_not_duplicate(): void
    {
        $this->seed(AdminSeeder::class);
        $this->seed(AdminSeeder::class);

        $this->assertEquals(1, User::where('email', 'admin@katteyes.test')->count());
    }
}