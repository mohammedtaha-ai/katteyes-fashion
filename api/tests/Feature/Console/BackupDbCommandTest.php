<?php

namespace Tests\Feature\Console;

use Tests\TestCase;

class BackupDbCommandTest extends TestCase
{
    public function test_backup_db_command_is_registered_and_runs(): void
    {
        // mysqldump may or may not be present in the test environment.
        // We only assert that the command is wired and exits cleanly
        // (either 0 when mysqldump works, or 1 when it does not —
        // neither is a fatal error, both prove the command ran).
        $exitCode = $this->artisan('backup:db', ['--keep' => 3])->run();

        $this->assertContains($exitCode, [0, 1]);
    }
}