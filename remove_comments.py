import os
import re
from pathlib import Path

def remove_comments_from_file(file_path):
    """Remove all comments from a Python file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        in_docstring = False
        docstring_char = None
        
        for line in lines:
            stripped = line.lstrip()
            
            # Skip migration files - don't modify them
            if 'migrations' in str(file_path):
                new_lines.append(line)
                continue
            
            # Handle docstrings (don't remove them)
            if not in_docstring:
                if stripped.startswith('"""') or stripped.startswith("'''"):
                    docstring_char = stripped[:3]
                    if stripped.count(docstring_char) >= 2:
                        # Single line docstring
                        new_lines.append(line)
                    else:
                        # Multi-line docstring start
                        in_docstring = True
                        new_lines.append(line)
                    continue
            else:
                new_lines.append(line)
                if docstring_char in stripped:
                    in_docstring = False
                continue
            
            # Remove inline comments but keep code
            if '#' in line:
                # Check if # is in a string
                in_string = False
                string_char = None
                for i, char in enumerate(line):
                    if char in ['"', "'"] and (i == 0 or line[i-1] != '\\'):
                        if not in_string:
                            in_string = True
                            string_char = char
                        elif char == string_char:
                            in_string = False
                    elif char == '#' and not in_string:
                        # Found comment outside string
                        code_part = line[:i].rstrip()
                        if code_part:  # If there's code before the comment
                            new_lines.append(code_part + '\n')
                        break
                else:
                    # No comment found or comment is in string
                    new_lines.append(line)
            else:
                # No comment in line
                new_lines.append(line)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def process_directory(directory):
    """Process all Python files in directory and subdirectories."""
    backend_path = Path(directory)
    python_files = list(backend_path.rglob('*.py'))
    
    processed = 0
    skipped = 0
    errors = 0
    
    for py_file in python_files:
        # Skip __pycache__ directories
        if '__pycache__' in str(py_file):
            skipped += 1
            continue
        
        print(f"Processing: {py_file}")
        if remove_comments_from_file(py_file):
            processed += 1
        else:
            errors += 1
    
    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  Processed: {processed} files")
    print(f"  Skipped: {skipped} files")
    print(f"  Errors: {errors} files")
    print(f"{'='*50}")

if __name__ == "__main__":
    backend_dir = "backend/app"
    if os.path.exists(backend_dir):
        print(f"Removing comments from Python files in {backend_dir}...\n")
        process_directory(backend_dir)
    else:
        print(f"Directory {backend_dir} not found!")
