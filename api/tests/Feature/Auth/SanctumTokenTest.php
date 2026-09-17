<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class SanctumTokenTest extends TestCase
{
    public function test_user_can_create_a_personal_access_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->assertIsString($token);
        $this->assertNotEmpty($token);
    }

    public function test_tokens_are_persisted_to_personal_access_tokens_table(): void
    {
        $user = User::factory()->create();
        $user->createToken('web');

        $this->assertCount(1, $user->fresh()->tokens);
    }
}
