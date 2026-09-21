import re
from typing import List, Dict, Any

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize line breaks and tabs
    text = re.sub(r'\r\n|\r', '\n', text)
    # Remove control characters except newlines
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Normalize multiple whitespace characters
    text = re.sub(r'[ \t]+', ' ', text)
    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_sections(text: str) -> Dict[str, str]:
    """
    Heuristically splits the paper into canonical academic sections.
    """
    cleaned = clean_text(text)
    
    # Common academic headings regex
    pattern = re.compile(
        r'(?:\n|\A)(?:\d+\.?\s*)?(abstract|introduction|related work|background|methodology|methods|system model|proposed method|experiments|evaluation|results|discussion|conclusion|references|bibliography)(?:\s*[:\.\n]|\Z)',
        re.IGNORECASE
    )
    
    matches = list(pattern.finditer(cleaned))
    if not matches:
        return {"full_text": cleaned}
    
    sections = {}
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(cleaned)
        heading = matches[i].group(1).lower().strip()
        body = cleaned[start:end].strip()
        sections[heading] = body
        
    return sections

def chunk_text(text: str, max_chunk_tokens: int = 12000) -> List[str]:
    """
    Splits text into manageable token windows while respecting paragraph boundaries.
    1 token ~ 4 characters.
    """
    cleaned = clean_text(text)
    max_chars = max_chunk_tokens * 4
    
    if len(cleaned) <= max_chars:
        return [cleaned]
        
    paragraphs = cleaned.split("\n\n")
    chunks = []
    current_chunk = []
    current_len = 0
    
    for p in paragraphs:
        p_len = len(p)
        if current_len + p_len > max_chars and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [p]
            current_len = p_len
        else:
            current_chunk.append(p)
            current_len += p_len + 2
            
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
        
    return chunks
