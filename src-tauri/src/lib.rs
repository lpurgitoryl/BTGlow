use curl_smile::{
    btle_communication::btle_api::{
        connect_to_btle_device, disconnect_from_btle_device, find_supported_devices,
    },
    hardware_abstraction_layer::device::SupportedDevice,
};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn scan_devices() -> Result<Vec<String>, String> {
    Ok(find_supported_devices()
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|d| d.name)
        .collect())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, scan_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
