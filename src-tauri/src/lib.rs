use curl_smile::{
    btle_communication::btle_api::{
        connect_to_btle_device, disconnect_from_btle_device, find_supported_devices,
    },
    hardware_abstraction_layer::device::SupportedDevice,
    Intent::{Brightness, Rgb, SwitchOn},
    LightState,
};

use std::sync::Mutex;
use tauri::Manager;
use tauri::State;

#[derive(Default)]
struct AppState {
    scanned_devices: Vec<SupportedDevice>,
    connected_device: Option<SupportedDevice>,
}

#[tauri::command]
async fn scan_devices(state: State<'_, Mutex<AppState>>) -> Result<Vec<String>, String> {
    let devices = find_supported_devices().await.map_err(|e| e.to_string())?;
    let names: Vec<String> = devices.iter().map(|d| d.name.clone()).collect();
    let mut app_state = state.lock().unwrap();

    app_state.scanned_devices = devices;

    Ok(names)
}

#[tauri::command]
async fn connect_to_device(
    device_name: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    let device = {
        let app_state = state.lock().unwrap();

        app_state
            .scanned_devices
            .iter()
            .find(|d| d.name == device_name)
            .cloned()
            .ok_or_else(|| "Device not found".to_string())?
    };

    connect_to_btle_device(&device)
        .await
        .map_err(|e| e.to_string())?;

    {
        let mut app_state = state.lock().unwrap();
        app_state.connected_device = Some(device.clone());
    }

    let mut d_state = LightState::new();
    d_state.update(SwitchOn(true));
    device
        .send_commands(&d_state)
        .await
        .map_err(|e| e.to_string())?;

    println!("Connected to {}", device.name);

    Ok(device.name)
}

#[tauri::command]
async fn disconnect_from_device(state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    let device = {
        let app_state = state.lock().unwrap();

        app_state
            .connected_device
            .clone()
            .ok_or_else(|| "No device is currently connected".to_string())?
    };

    let mut d_state = LightState::new();
    d_state.update(SwitchOn(false));
    device
        .send_commands(&d_state)
        .await
        .map_err(|e| e.to_string())?;

    disconnect_from_btle_device(&device)
        .await
        .map_err(|e| e.to_string())?;

    {
        let mut app_state = state.lock().unwrap();
        app_state.connected_device = None;
    }

    println!("Disconnected from {}", device.name);

    Ok(device.name)
}

#[tauri::command]
async fn update_light_color(
    red: u8,
    green: u8,
    blue: u8,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    let device = {
        let app_state = state.lock().unwrap();

        app_state
            .connected_device
            .clone()
            .ok_or_else(|| "No device is currently connected".to_string())?
    };

    let mut d_state = LightState::new();
    d_state.update(Rgb { red, green, blue });
    device
        .send_commands(&d_state)
        .await
        .map_err(|e| e.to_string())?;

    println!("Updated color for {}", device.name);

    Ok(device.name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(AppState::default()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_devices,
            connect_to_device,
            disconnect_from_device,
            update_light_color
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
