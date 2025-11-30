use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct FileEntry {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<FileEntry>>,
}

// Read directory contents recursively
#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = PathBuf::from(&path);

    if !dir_path.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    read_dir_recursive(&dir_path)
}

fn read_dir_recursive(dir: &PathBuf) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();

    let read_dir = fs::read_dir(dir)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in read_dir {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        let name = entry.file_name()
            .to_string_lossy()
            .to_string();

        // Skip hidden files and directories
        if name.starts_with('.') {
            continue;
        }

        let is_directory = path.is_dir();
        let path_str = path.to_string_lossy().to_string();

        let children = if is_directory {
            // For directories, read their contents
            match read_dir_recursive(&path) {
                Ok(child_entries) => Some(child_entries),
                Err(_) => Some(Vec::new()), // If we can't read, just show empty
            }
        } else {
            None
        };

        // Only include markdown files and directories
        if is_directory || name.ends_with(".md") || name.ends_with(".markdown") {
            entries.push(FileEntry {
                name,
                path: path_str,
                is_directory,
                children,
            });
        }
    }

    // Sort: directories first, then files, both alphabetically
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

// Read file contents
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

// Write file contents
#[tauri::command]
fn write_file(path: String, contents: String) -> Result<(), String> {
    fs::write(&path, contents)
        .map_err(|e| format!("Failed to write file: {}", e))
}

// Create a new file
#[tauri::command]
fn create_file(path: String) -> Result<(), String> {
    fs::write(&path, "")
        .map_err(|e| format!("Failed to create file: {}", e))
}

// Delete a file
#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    fs::remove_file(&path)
        .map_err(|e| format!("Failed to delete file: {}", e))
}

// Rename a file
#[tauri::command]
fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename file: {}", e))
}

// Create a new folder
#[tauri::command]
fn create_folder(path: String) -> Result<(), String> {
    fs::create_dir(&path)
        .map_err(|e| format!("Failed to create folder: {}", e))
}

// Delete a folder (recursively)
#[tauri::command]
fn delete_folder(path: String) -> Result<(), String> {
    fs::remove_dir_all(&path)
        .map_err(|e| format!("Failed to delete folder: {}", e))
}

// Rename a folder
#[tauri::command]
fn rename_folder(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename folder: {}", e))
}

// Move a file or folder to a target directory
#[tauri::command]
fn move_item(source_path: String, target_dir: String) -> Result<(), String> {
    let source = PathBuf::from(&source_path);
    let target_directory = PathBuf::from(&target_dir);

    // Validate source exists
    if !source.exists() {
        return Err(format!("Source does not exist: {}", source_path));
    }

    // Validate target is a directory
    if !target_directory.is_dir() {
        return Err(format!("Target is not a directory: {}", target_dir));
    }

    // Get the filename from source
    let file_name = source
        .file_name()
        .ok_or_else(|| "Failed to get filename from source path".to_string())?;

    // Create the new path in target directory
    let new_path = target_directory.join(file_name);

    // Check if an item with the same name already exists in target
    if new_path.exists() {
        return Err(format!(
            "An item with the name '{}' already exists in the target directory",
            file_name.to_string_lossy()
        ));
    }

    // Move the item
    fs::rename(&source, &new_path)
        .map_err(|e| format!("Failed to move item: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_directory,
            read_file,
            write_file,
            create_file,
            delete_file,
            rename_file,
            create_folder,
            delete_folder,
            rename_folder,
            move_item,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
