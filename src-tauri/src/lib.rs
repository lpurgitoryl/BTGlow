use curl_smile::{
    btle_communication::btle_api::{
        connect_to_btle_device, disconnect_from_btle_device, find_supported_devices,
    },
    hardware_abstraction_layer::device::SupportedDevice,
    Intent::{Rgb, SwitchOn},
    LightState,
};

use serde::Serialize;
use tauri_plugin_store::StoreExt;

use std::{println, sync::Mutex};
use tauri::State;
use tauri::{AppHandle, Manager};

#[derive(Default)]
struct AppState {
    scanned_devices: Vec<SupportedDevice>,
    connected_device: Option<SupportedDevice>,
}

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
enum StartupBluetoothResult {
    Connected { device_name: String },
    DevicesFound { devices: Vec<String> },
    NoDevicesFound,
}

fn load_saved_device_name(app: &tauri::AppHandle) -> Result<Option<String>, String> {
    let store = app
        .store("bluetooth.json")
        .map_err(|error| error.to_string())?;

    let Some(value) = store.get("last_connected_device_name") else {
        return Ok(None);
    };

    let device_name = serde_json::from_value::<String>(value).map_err(|error| error.to_string())?;
    println!("Loaded saved device name: {}", device_name);

    Ok(Some(device_name))
}

fn save_device_name(app: &tauri::AppHandle, device_name: &str) -> Result<(), String> {
    let store = app
        .store("bluetooth.json")
        .map_err(|error| error.to_string())?;

    store.set(
        "last_connected_device_name",
        serde_json::Value::String(device_name.to_string()),
    );

    store.save().map_err(|error| error.to_string())?;
    println!("Saved device name: {}", device_name);

    Ok(())
}

#[tauri::command]
async fn initialize_bluetooth(
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<StartupBluetoothResult, String> {
    let saved_device_name = load_saved_device_name(&app)?;

    let devices = find_supported_devices()
        .await
        .map_err(|error| error.to_string())?;

    if let Some(saved_name) = saved_device_name {
        if let Some(device) = devices
            .iter()
            .find(|device| device.name == saved_name)
            .cloned()
        {
            println!("Found saved device: {}", device.name);
            println!("Attempting automatic connection...");

            match connect_to_btle_device(&device).await {
                Ok(()) => {
                    println!("Automatic connection succeeded");

                    let mut device_state = LightState::new();
                    device_state.update(SwitchOn(true));

                    device.send_commands(&device_state).await.map_err(|error| {
                        format!("Connected, but initial command failed: {error}")
                    })?;

                    {
                        let mut app_state = state.lock().unwrap();
                        app_state.scanned_devices = devices;
                        app_state.connected_device = Some(device.clone());
                    }

                    return Ok(StartupBluetoothResult::Connected {
                        device_name: device.name,
                    });
                }

                Err(error) => {
                    println!("Automatic connection to {} failed: {}", device.name, error);
                }
            }
        } else {
            println!("Saved device was not found during scan: {saved_name}");
        }
    }
    let device_names: Vec<String> = devices.iter().map(|device| device.name.clone()).collect();

    {
        let mut app_state = state.lock().unwrap();
        app_state.scanned_devices = devices;
        app_state.connected_device = None;
    }

    if device_names.is_empty() {
        Ok(StartupBluetoothResult::NoDevicesFound)
    } else {
        Ok(StartupBluetoothResult::DevicesFound {
            devices: device_names,
        })
    }
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
    app: AppHandle,
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

    save_device_name(&app, &device.name)?;

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
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            app.manage(Mutex::new(AppState::default()));

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_devices,
            connect_to_device,
            disconnect_from_device,
            update_light_color,
            initialize_bluetooth
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
