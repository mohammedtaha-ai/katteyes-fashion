<?php
namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $payload = [
            'name' => 'سامي',
            'email' => 'sami@example.test',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
        ];

        $r = $this->postJson('/api/v1/auth/register', $payload);
        $r->assertCreated()
          ->assertJsonStructure(['data' => ['token', 'user' => ['id','name','email','role']]])
          ->assertJsonPath('data.user.role', 'customer');

        $this->assertDatabaseHas('users', ['email' => 'sami@example.test', 'role' => 'customer']);
        $this->assertTrue(Hash::check('secret1234', User::first()->password));
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dup@example.test']);
        $r = $this->postJson('/api/v1/auth/register', [
            'name' => 'x',
            'email' => 'dup@example.test',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
        ]);
        $r->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_returns_token_for_existing_user(): void
    {
        User::factory()->create([
            'email' => 'l@test.test',
            'password' => bcrypt('password12'),
        ]);
        $r = $this->postJson('/api/v1/auth/login', ['email' => 'l@test.test', 'password' => 'password12']);
        $r->assertOk()->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create(['email' => 'l@test.test']);
        $r = $this->postJson('/api/v1/auth/login', ['email' => 'l@test.test', 'password' => 'bad']);
        $r->assertStatus(401);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('web')->plainTextToken;
        $r = $this->withHeaders(['Authorization' => "Bearer $token"])
                     ->getJson('/api/v1/auth/me');
        $r->assertOk()->assertJsonPath('data.user.email', $user->email);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;
        $this->withHeaders(['Authorization' => "Bearer $token"])
             ->postJson('/api/v1/auth/logout')
             ->assertNoContent();
        $this->assertCount(0, $user->fresh()->tokens);
    }
}
