<?php

namespace App\Enums;

enum PaperStatus: string
{
    case UPLOADED = 'UPLOADED';
    case PROCESSING = 'PROCESSING';
    case ANALYZED = 'ANALYZED';
    case FAILED = 'FAILED';
    case ARCHIVED = 'ARCHIVED';
}
