<?php
// Copy to jogoo-private/config.php OUTSIDE the website folder, e.g.
//   /home/<cpanel-user>/jogoo-private/config.php
// (the API looks there first), and fill in the values from cPanel → MySQL Databases.
return [
    'db_host' => 'localhost',
    'db_name' => 'cpuser_jogoo',
    'db_user' => 'cpuser_jogoo',
    'db_pass' => 'CHANGE-ME',

    // Long random string. Needed once, to open /api/install.php, connect the
    // database and create the tables.
    'setup_key' => 'CHANGE-ME-to-a-long-random-string',

    // Secret for hashing email codes. Long random string; never share it.
    'app_secret' => 'CHANGE-ME-another-long-random-string',

    // These emails become super admins (can manage staff) once they sign up
    // and confirm their email with the code.
    'super_admin_emails' => ['roykingnibajogoo@gmail.com'],

    // Sender of the sign-in / reset code emails. Use an address on a domain
    // whose email is hosted on this cPanel (so SPF/DKIM pass).
    'mail_from' => 'no-reply@jogoo.africa',
    'mail_from_name' => 'JOGOO Agriculture',

    // Sign-in lasts this many days on a device.
    'session_days' => 30,

    // Only these origins may call the API from a browser (same origin is always OK).
    'allowed_origins' => ['https://meha.jogoo.africa'],
];
