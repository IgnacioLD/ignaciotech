---
title: "Construyendo Augen: Visión con IA para Accesibilidad"
date: 2024-03-01
tags: ["IA", "Accesibilidad", "Visión por Computador", "Desarrollo Web"]
description: "Retos y aprendizajes desarrollando un asistente de visión con IA centrado en accesibilidad"
image: "/images/placeholders/blog-edit.svg"
---

Construir Augen ha sido uno de los proyectos más gratificantes y exigentes de mi carrera. Crear un asistente de visión con IA que realmente sirva a la comunidad de accesibilidad requiere tanto dominio técnico como una comprensión profunda de las necesidades de las personas usuarias.

## Enfoque Accesible desde el Origen

Desde el primer día, el requisito principal fue la accesibilidad.

### Compatibilidad con Lectores de Pantalla
Probé meticulosamente con NVDA, JAWS y VoiceOver para garantizar una experiencia fluida.

### Navegación por Teclado
La aplicación es 100% navegable por teclado. No solo se trata de `tabindex`: hay gestión cuidadosa del foco y flujo lógico de navegación.

### Interfaz por Voz
La interacción principal es por voz, con la interfaz visual como apoyo. Esto invirtió el paradigma UI/UX tradicional y nos llevó a soluciones nuevas.

## Retos Técnicos

### Visión en Tiempo Real
Integramos APIs de visión manteniendo la respuesta de la UI. Implementé colas de procesamiento para no bloquear la interacción por voz.

### Voz Multilingüe
Dar soporte a 12 idiomas implicó matices de ASR/TTS distintos por cultura.

### Arquitectura PWA
El Service Worker gestiona caché de modelos y actualizaciones de contenido.

## Desarrollo Centrado en la Persona

### Feedback de la Comunidad
Sesiones regulares con personas ciegas o con baja visión revelaron supuestos invisibles y guiaron el roadmap.

### Iteración Continua
Cada ciclo incluye auditorías de accesibilidad y mejoras. La versión actual condensa decenas de iteraciones.

## Impacto

Augen tiene adopción en contextos educativos de 8 países y ha abierto colaboraciones con organizaciones de accesibilidad. Lo más valioso: usuarios que reportan más autonomía en su día a día.

## Próximos Pasos

- App móvil (iOS/Android)
- Reconocimiento mejorado por contexto
- Integración con hogar inteligente
- Alianzas educativas

