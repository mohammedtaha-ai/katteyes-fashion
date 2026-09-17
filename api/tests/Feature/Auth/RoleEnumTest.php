<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RoleEnumTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_table_has_role_column(): void
    {
        $columns = Schema::getColumnListing('users');
        $this->assertContains('role', $columns);
    }

    public function test_role_column_defaults_to_customer(): void
    {
        DB::table('users')->insert([
            'name' => 'x',
            'email' => 'x@y.test',
            'password' => bcrypt('x'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $row = DB::table('users')->first();
        $this->assertNotNull($row);
        $this->assertSame('customer', $row->role);
    }
}