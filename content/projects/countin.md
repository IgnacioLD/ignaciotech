---
title: "CountIn: Vision-Based Occupancy Tracker"
date: 2025-10-11
status: "active"
tech: ["Computer Vision", "TensorFlow.js", "Edge AI", "Real-Time Tracking", "Browser ML"]
image: "/images/placeholders/project-apps.svg"
links:
  - name: "Live Demo"
    url: "https://countin.ignacio.tech"
  - name: "GitHub"
    url: "https://github.com/IgnacioLD/countin"
description: "Real-time people counting with computer vision AI running entirely in the browser"
---

# CountIn: Real-Time Vision-Based Occupancy Tracker

CountIn is a browser-based computer vision system that uses AI to count people in real-time for event occupancy management and crowd analytics. Built entirely with TensorFlow.js, it runs 100% locally in your browser—no server required, complete privacy.

## The Vision-Based Approach

Instead of manual counting or infrastructure-heavy solutions, CountIn uses your device's camera and on-device AI to detect and track people automatically. Draw virtual "counting lines" across entrances and exits, and the system counts every person who crosses them, tracking directional flow (in/out).

## Key Features

### Computer Vision AI
- **TensorFlow.js Detection**: COCO-SSD and RF-DETR models for accurate person detection
- **Custom Tracking Algorithms**: Built-from-scratch person tracking with confidence-based matching
- **Geometric Line Crossing**: Vector math to detect when people cross virtual counting lines
- **Real-Time Processing**: Processes webcam feed at near-real-time speeds

### Edge AI Benefits
- **Privacy-First**: All AI processing happens locally in your browser—zero data transmission
- **No Installation**: Works directly in any modern web browser
- **Offline-Capable**: No internet connection needed after initial page load
- **Free to Use**: No cloud costs, no API limits, completely self-contained

### Practical Features
- **Multi-Line Support**: Track multiple entrances/exits simultaneously
- **Directional Counting**: Separate in/out counts for each line
- **Live Statistics**: Real-time dashboard with occupancy levels
- **Historical Charts**: Visualize crowd flow over time
- **Activity Logging**: Timestamped log of all crossing events

## Technical Deep-Dive

### Architecture

```
Webcam Feed → TensorFlow.js Detection → Custom Tracking →
Line Crossing Detection → Count Updates → Visualization
```

The system implements:
1. **Person Detection**: TensorFlow.js COCO-SSD model identifies people in each frame
2. **Custom Tracking**: Centroid-based tracking algorithm maintains consistent IDs across frames
3. **Line Crossing Detection**: Geometric algorithm using vector math to detect trajectory intersections
4. **Real-Time Updates**: Efficient state management for smooth UI updates

### Built-From-Scratch Components

- **PersonTracker Class**: Custom implementation with:
  - Euclidean distance matching between frames
  - Confidence thresholding (filters false positives)
  - Disappearance tracking (handles temporary occlusion)
  - Position history for trajectory analysis

- **LineManager**: Geometric detection with:
  - Line-segment intersection using cross products
  - Directional awareness (determines in vs out)
  - Per-line counting state management

### Performance Optimization

- Processes every 2nd frame for real-time performance
- Canvas-based rendering for efficient visualization
- Minimal DOM manipulation
- Efficient tracking state management
- ~250-500ms per frame (hardware-dependent)

## Use Cases

This started as an event management tool but has broader applications:

- **Event Management**: Track attendance at conferences, concerts, festivals
- **Retail Analytics**: Monitor customer flow and identify peak hours
- **Safety Compliance**: Ensure venue capacity limits
- **Crowd Management**: Real-time occupancy for public spaces
- **Research & Education**: Computer vision demonstrations and learning

## Technology Stack

- **ML Framework**: TensorFlow.js (browser-based inference)
- **Detection Models**: COCO-SSD, RF-DETR
- **Custom Algorithms**: Person tracking, line crossing detection
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3
- **Architecture**: Event-driven, modular design

## Privacy & Ethics

Built with privacy and ethics as core principles:

- **No Data Collection**: Everything runs locally in your browser
- **No Server Communication**: Optional mocked sync for demo purposes only
- **Camera Privacy**: Explicit user permission required
- **GDPR Compliant**: No personal data stored or transmitted
- **Ethical Use**: Designed for counting, not individual tracking/surveillance

## What I Learned

Building CountIn taught me valuable lessons about edge AI:

### Computer Vision Challenges
- Lighting conditions dramatically affect detection accuracy
- Occlusion handling requires careful tracking state management
- Real-time performance requires smart frame-skipping strategies
- Confidence thresholds need tuning for different environments

### Browser-Based ML Limitations
- TensorFlow.js performance varies wildly across devices
- Memory management is critical (models can consume 500MB+)
- Frame processing speed depends on hardware acceleration
- Mobile browsers have different constraints than desktop

### From-Scratch Implementations
Building custom tracking algorithms (instead of using libraries) gave me deep understanding of:
- How centroid tracking actually works
- Why geometric algorithms are elegant for line crossing
- The tradeoffs between accuracy and performance
- How to debug ML systems when they behave unexpectedly

## Current Status & Future

**Current**: Production-ready for local use, tested across multiple browsers and devices

**Future Enhancements**:
- Additional ML models (YOLOv5, MobileNet)
- Advanced tracking (DeepSORT, Kalman filtering)
- Backend integration for data persistence
- Multi-camera support
- Heatmap visualization
- Mobile app version with ONNX

## Try It Yourself

Visit [countin.ignacio.tech](https://countin.ignacio.tech) to try the live demo. Works best with:
- Modern browser (Chrome/Firefox/Safari/Edge)
- Webcam access
- Decent lighting conditions
- 4GB+ RAM for smooth performance

Or clone from [GitHub](https://github.com/IgnacioLD/countin) and run locally—it's just static HTML/JS/CSS.

---

CountIn demonstrates that sophisticated computer vision AI can run entirely in the browser, enabling privacy-preserving, zero-cost, accessible ML applications. Edge AI is real, and it's powerful.
