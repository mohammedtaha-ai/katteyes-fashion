<?php

namespace Tests\Feature\Auth;

use App\Http\Middleware\EnsureRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class EnsureRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_passes_admin_role_check(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $request = Request::create('/api/v1/__probe_admin', 'GET');
        $request->setUserResolver(fn () => $admin);

        $response = (new EnsureRole())->handle(
            $request,
            fn () => response('ok'),
            'admin',
        );

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('ok', $response->getContent());
    }

    public function test_customer_user_is_forbidden_on_admin_only_route(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $request = Request::create('/api/v1/__probe_admin2', 'GET');
        $request->setUserResolver(fn () => $customer);

        $response = (new EnsureRole())->handle(
            $request,
            fn () => response('ok'),
            'admin',
        );

        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('ممنوع', $response->getData()->message);
    }

    public function test_unauthenticated_request_is_forbidden(): void
    {
        $request = Request::create('/api/v1/__probe_admin3', 'GET');
        $request->setUserResolver(fn () => null);

        $response = (new EnsureRole())->handle(
            $request,
            fn () => response('ok'),
            'admin',
        );

        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('ممنوع', $response->getData()->message);
    }
}