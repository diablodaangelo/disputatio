<?php

return [
    'base_url' => env('AI_SERVICE_URL', 'http://127.0.0.1:8001'),
    'internal_key' => env('INTERNAL_SERVICE_KEY', 'disputatio-secret-internal-token-2026'),
    'timeout' => (int) env('AI_SERVICE_TIMEOUT', 120),
];
