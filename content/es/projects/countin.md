---
title: "CountIn: Control de Aforo en Tiempo Real"
date: 2022-09-01
status: "completed"
tech: ["Android", "Kotlin", "Tiempo Real", "Material Design", "Firebase"]
image: "/images/placeholders/project-apps.svg"
links:
  - name: "GitHub"
    url: "https://github.com/igdel/countin-android"
description: "App Android para control de aforo en tiempo real con arquitectura moderna"
---

# CountIn: Gestión Inteligente de Capacidad

CountIn ayuda a organizadores a monitorear el aforo en tiempo real, cumplir normativa y optimizar recursos del recinto.

## Características

- **Entradas Múltiples** con sincronización en vivo entre dispositivos.
- **Modo Offline** con cola de sincronización.
- **Alertas** al aproximarse a la capacidad máxima.
- **Históricos y Exportación** para análisis.

## Implementación Técnica

- **Arquitectura**: MVVM, Repositorios y DI (Hilt).
- **Datos**: Room local + Firebase Realtime Database.
- **Fondo**: WorkManager para tareas críticas.
- **UI**: Material Design 3 + Compose.

## Resultados

- **Sincronización en Tiempo Real** sin conflictos.
- **Diseño Offline-First** robusto.
- **Óptimo en Batería** y rendimiento fluido.

Más información y código en el [repositorio](https://github.com/igdel/countin-android).

