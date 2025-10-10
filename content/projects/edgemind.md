---
title: "EdgeMind: Edge MLOps Experiments on Android"
date: 2025-10-10
status: "experimental"
tech: ["Android", "Kotlin", "ONNX Runtime", "Machine Learning", "Edge AI", "NNAPI"]
image: "/images/projects/edgemind.svg"
featured: true
links:
  - name: "GitHub"
    url: "https://github.com/IgnacioLD/edgemind"
description: "Experimental LLM inference system for Android exploring custom tokenization, KV caching, and hardware acceleration from scratch"
---

# EdgeMind: Bringing LLMs to the Edge

EdgeMind is an experimental on-device LLM inference system for Android. The project explores how large language models can run on mobile devices with proper optimization, achieving 4 tokens/second on consumer hardware with complete privacy - no cloud, no data transmission, 100% local. Currently in research and experimentation phase.

## Project Evolution

### Three Major Pivots

**Initial Vision (Android Auto Voice Assistant)**
- Goal: Privacy-first voice assistant for cars
- Stack: Whisper (STT) + Llama 3.2 (LLM) + Pico TTS
- Reality: Too ambitious for first iteration
- Learning: Start with core technology, expand later

**First Pivot (Local AI Assistant)**
- Focus: Nail on-device LLM inference first
- Scope: Single model, production quality
- Decision: Android Auto features become future work
- Impact: Allowed deep focus on hard problems

**Second Pivot (Two Branches)**
- Branch 1: Document parsing with Granite Docling (258M params)
- Branch 2: Conversational AI with Phi-3 mini (3.8B params)
- Rationale: Different use cases, different optimizations
- Status: Conversational branch production-ready

## Technical Architecture

### Core Components

**Model Layer**
- Phi-3 mini INT4 (3.8B parameters quantized to 2.6GB)
- ONNX Runtime 1.19.2 with IR version 7
- NNAPI hardware acceleration (NPU/TPU/DSP)
- Memory-mapped model loading

**Tokenization**
- Custom SentencePiece BPE implementation
- 32,064 vocabulary tokens
- 61,249 merge rules
- Handles byte tokens, special tokens, space markers
- Zero external dependencies (350 lines of Kotlin)

**Inference Pipeline**
- KV cache implementation (32 layers × 2 tensors)
- Streaming generation via Kotlin Flow
- Smart stopping criteria (n-gram detection)
- Proper memory management (no leaks)

**User Interface**
- Jetpack Compose Material 3
- Real-time token streaming
- Manual stop button
- Clean Architecture (MVVM + Domain/Data)

## Key Technical Achievements

### 1. Custom Tokenizer from Scratch

Built complete SentencePiece BPE tokenizer by parsing tokenizer.json:
- Avoided 50MB+ external dependency
- Full control over encoding/decoding behavior
- Deep understanding of tokenization process
- Production-ready implementation in 350 lines

### 2. KV Cache Optimization

Implemented transformer key-value caching for 6x speedup:
- Before: 800ms → 30s+ (exponential slowdown)
- After: 120-250ms (consistent performance)
- Complexity: O(n²) → O(n)
- Critical for mobile viability

### 3. Memory Leak Resolution

Debugged and fixed critical OOM issues:
- Symptom: App crashes after ~200 tokens
- Root cause: 12,800+ leaked tensors
- Solution: Proper cache cleanup lifecycle
- Result: Stable memory, no crashes

### 4. Smart Stopping Criteria

Multi-layered approach to end generation naturally:
- EOS token detection
- Consecutive repetition (10+ same tokens)
- N-gram pattern recognition (4-grams, 5-grams)
- 400 token safety limit
- Manual user control via UI button

### 5. Hardware Acceleration

NNAPI integration for NPU utilization:
- 4x speedup from hardware acceleration
- Combined with KV cache: 24x total speedup
- Works across different device chipsets
- Graceful CPU fallback

## Production Metrics

### Performance

```
Test: "Tell me a short story"
Generated: 311 tokens in 78 seconds
Throughput: 4 tokens/second
Per-token: ~250ms average
Memory: Stable at ~500MB
Crashes: None
Quality: Coherent narrative with plot and characters
```

### Quality Example

```
Input: "Tell me a short story"

Output: "Certainly! Here's a short story for you:

Once upon a time, in a peaceful village nestled between lush green
hills, there lived a young girl named Lily. She had a kind heart and
a curious mind. One day, while exploring the nearby forest, she
discovered a mysterious, ancient artifact - a beautifully crafted
golden amulet with intricate engravings...

[Continues with coherent plot involving village elders, a historian
named Elara, and a wise decision about the amulet's use - 311 tokens
total, stopped naturally via n-gram repetition detection]"
```

## Development Process

### From Scratch Philosophy

**Why Build Custom vs. Use Libraries?**

Decision matrix applied to each component:

Tokenizer:
- Library: ONNX Runtime GenAI (50MB+, manual AAR, limited control)
- Custom: 350 lines Kotlin (3.5MB config, full control, deep learning)
- Choice: Custom (worth the effort)

KV Cache:
- Library: Not available in standard ONNX Runtime
- Custom: Manual implementation required
- Choice: Custom (only option)

Inference Runtime:
- Library: ONNX Runtime (mature, well-tested)
- Custom: Would take months, reinventing wheel
- Choice: Library (right tool for the job)

The pattern: Build custom when it provides significant value (learning, control, size). Use libraries when they're the right tool.

### Testing Strategy

Multi-device testing with devices found around my flat:
- Old S10+ from my mom
- Pixel 7a
- Various other Android devices

Why this matters:
- Different NPU capabilities per chipset
- Varying memory constraints
- Different thermal throttling thresholds
- Real-world hardware diversity

Edge ML must work on the chaos of actual devices, not just the development phone.

## Technical Challenges Solved

### Challenge 1: Tokenizer Mismatch
**Problem**: 99-token placeholder vs. 32k-token model
**Solution**: Custom BPE implementation from tokenizer.json
**Result**: Perfect text quality, zero dependencies

### Challenge 2: Exponential Slowdown
**Problem**: O(n²) complexity without caching
**Solution**: Transformer KV cache implementation
**Result**: 6x speedup, constant-time tokens

### Challenge 3: Memory Leaks
**Problem**: OOM crashes after ~200 tokens
**Solution**: Proper tensor lifecycle management
**Result**: Stable memory, unlimited generation

### Challenge 4: Premature Stopping
**Problem**: Heuristics stopped mid-sentence
**Solution**: N-gram detection + user control
**Result**: Natural endings, manual override

### Challenge 5: Performance
**Problem**: 800ms/token too slow for production
**Solution**: NNAPI + KV cache + quantization
**Result**: 250ms/token (24x total speedup)

## Current Status

**Production Ready**: Conversational AI branch with Phi-3 mini
- All critical issues resolved
- Stable memory management
- Hardware acceleration working
- Quality text generation
- User control implemented

**Experimental**: Document parsing branch with Granite Docling
- OCR and table extraction
- Multi-page document processing
- Structured data export
- Active research and development

## Future Roadmap

### Short Term
- Temperature/top-p sampling (currently greedy)
- Conversation history persistence with Room DB
- Multiple concurrent chat sessions
- Model parameter tuning UI

### Medium Term
- Speech-to-text integration (Whisper)
- Text-to-speech synthesis
- Android Auto voice interface
- Voice-controlled document queries

### Long Term
- Model distillation for smaller variants
- On-device LoRA fine-tuning
- INT2 quantization experiments
- Multi-model orchestration

## Technology Stack

**Android**
- Kotlin 1.9.20
- Jetpack Compose
- Material 3
- Coroutines + Flow
- Hilt dependency injection

**Machine Learning**
- ONNX Runtime 1.19.2
- NNAPI acceleration
- Custom tokenization
- INT4 quantization

**Architecture**
- Clean Architecture
- MVVM pattern
- Repository pattern
- Use case layer

## Key Learnings

### Edge MLOps is Different

1. **Memory discipline**: One leak kills mobile apps
2. **Performance required**: Users won't wait 30s/token
3. **Hardware diversity**: Test on real, varied devices
4. **Dependencies cost**: APK size, complexity, control
5. **User control**: Models are unpredictable, give override

### From Scratch Benefits

- Deep understanding of underlying algorithms
- Debugging becomes possible (not black box)
- Full control over behavior and optimization
- Minimal dependencies and APK size
- Learning compounds over time

### Mobile Constraints Drive Innovation

- Forced quantization (discovered INT4 works)
- Required KV cache (learned transformer internals)
- Demanded memory discipline (better code)
- Necessitated hardware acceleration (NNAPI expertise)
- Enabled creativity (custom solutions)

## Open Source

The complete source code is available on GitHub:
[github.com/IgnacioLD/edgemind](https://github.com/IgnacioLD/edgemind)

Contributions welcome. Issues and pull requests appreciated.

## Conclusion

EdgeMind demonstrates that production-quality LLM inference on Android is achievable with proper engineering. The project evolved through three major pivots, each focusing the scope and deepening the technical work. What started as an ambitious multi-model system became a deep exploration of edge MLOps: quantization, tokenization, caching, acceleration, and memory management.

The result: 4 tokens/second, coherent text, stable memory, complete privacy. All running locally on Android. All from scratch. All open source.

The journey continues. Edge AI is just getting started.
