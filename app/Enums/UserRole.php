<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case RESEARCHER = 'researcher';
    case REVIEWER = 'reviewer';
}
