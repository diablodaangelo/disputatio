<?php

namespace App\Enums;

enum ReviewRecommendation: string
{
    case ACCEPT = 'ACCEPT';
    case MINOR_REVISION = 'MINOR_REVISION';
    case MAJOR_REVISION = 'MAJOR_REVISION';
    case REJECT = 'REJECT';
}
