---
title: "Building EdgeMind: Experimenting with LLM Inference on Android"
date: 2025-10-10
tags: ["Android", "Machine Learning", "Edge AI", "ONNX", "MLOps"]
categories: ["Android Development", "Machine Learning"]
description: "Edge MLOps experiments: implementing Phi-3 mini on Android from scratch with NNAPI acceleration, custom tokenization, and KV caching"
image: "/images/projects/edgemind.svg"
featured: true
readtime: "12 min read"
level: "Advanced"
type: "blog"
---

Building an LLM inference system on Android from scratch as an experiment taught me more about edge computing, MLOps, and mobile AI than any course could. This is the story of EdgeMind - a research project that started as an Android Auto voice assistant, pivoted to local AI chat, and ended up as two separate experimental branches: one for document parsing with Granite Docling and another for conversational AI with Phi-3.

## The Journey: Three Pivots

### Initial Vision: Android Auto Voice Assistant

The project began with a clear goal: build a privacy-first voice assistant for Android Auto that runs 100% locally. No cloud, no data transmission, complete privacy. The architecture was ambitious:

- Whisper Tiny for speech-to-text
- Llama 3.2 1B for language understanding
- Kokoro/Pico TTS for speech synthesis
- Android Auto APIs for car integration

Reality hit quickly. Running multiple models simultaneously on mobile hardware proved challenging. The focus shifted.

### First Pivot: Local AI Assistant

I narrowed scope to nail the core technology first: on-device LLM inference. Choose one model, make it work perfectly, then expand. The Android Auto features became future work. This pivot was crucial - it allowed me to focus on solving the hard problems: tokenization, KV caching, hardware acceleration, memory management.

### Second Pivot: Two Branches

During experimentation, I discovered two distinct use cases emerging:

1. **Document Understanding**: Using Granite Docling (258M parameters) for OCR and document parsing
2. **Conversational AI**: Using Phi-3 mini (3.8B parameters) for general chat

Rather than force these into one app, I split them into separate branches. Each could be optimized for its specific use case. This post focuses on the conversational AI branch with Phi-3.

## Technical Deep Dive: Edge MLOps Challenges

### Challenge 1: Model Selection and Quantization

**The Problem**: A full Phi-3 mini model is 7.6GB in FP32. Mobile devices don't have that kind of spare RAM.

**The Solution**: INT4 quantization reduces the model to 2.6GB while maintaining quality. Microsoft's ONNX export with RTN (Round-To-Nearest) quantization at block size 32 provided the best size/quality tradeoff.

```
Original: 3.8B params × 32 bits = 7.6GB
Quantized: 3.8B params × 4 bits = 2.6GB (65% reduction)
Quality loss: Minimal for chat applications
```

### Challenge 2: The Tokenizer Nightmare

**The Problem**: The model outputs token IDs (0-32,063). You need a tokenizer to convert these to text. Initially, I used a placeholder 99-token character-level tokenizer. Result: perfect gibberish.

**The Failed Approach**: "Just use a library." ONNX Runtime GenAI isn't on Maven, requires manual AAR download, adds 50MB+ to the app.

**The From-Scratch Solution**: Implement Phi-3's SentencePiece BPE tokenizer from scratch by parsing tokenizer.json:

```kotlin
class Phi3BPETokenizer(context: Context) {
    private val vocab: Map<String, Int>              // 32,000 base tokens
    private val merges: Map<Pair<String, String>, Int>  // 61,249 merge rules
    private val specialTokens: Map<String, Int>      // 13 special tokens

    fun encode(text: String): LongArray {
        // 1. Replace spaces with ▁ (U+2581) - SentencePiece format
        // 2. Split into characters
        // 3. Apply BPE merges greedily
        // 4. Map to token IDs
    }

    fun decode(tokens: LongArray): String {
        // 1. Map IDs to strings
        // 2. Handle byte tokens like <0x0A> (newline)
        // 3. Replace ▁ with spaces
        // 4. Concatenate
    }
}
```

350 lines of Kotlin, zero dependencies, complete control. Worth every hour of debugging.

### Challenge 3: KV Cache - The 6x Speedup

**The Problem**: Without KV cache, each new token requires reprocessing all previous tokens. Token 1 processes 1 token, token 2 processes 2 tokens, token 50 processes 50 tokens. O(n²) complexity makes generation impossibly slow.

**The Measurement**:
```
Without cache:
Token 1:  800ms
Token 10: 2.5s
Token 50: 30s+

With cache:
Token 1:  200ms
Token 10: 180ms
Token 50: 150ms
```

**The Implementation**: Transformers compute key/value tensors for attention. These can be cached and reused:

```kotlin
data class InferenceWithCacheResult(
    val logits: FloatArray,
    val presentKeyValues: Map<String, OnnxTensor>  // 32 layers × 2 = 64 tensors
)

var kvCache: Map<String, OnnxTensor>? = null

for (token in 0 until maxTokens) {
    val inputIds = if (token == 0) {
        fullPrompt  // First: process all input
    } else {
        longArrayOf(lastGeneratedToken)  // Subsequent: only new token
    }

    val result = model.runInferenceWithCache(
        inputIds = inputIds,
        attentionMask = attentionMask,
        pastKeyValues = kvCache  // Reuse previous computation
    )

    val oldCache = kvCache
    kvCache = result.presentKeyValues

    // Critical: close old cache to prevent memory leak
    oldCache?.values?.forEach { it.close() }
}
```

### Challenge 4: Memory Leaks on Mobile

**The Problem**: After implementing KV cache, the app would crash after ~200 tokens with "Process has died." Device would get hot, performance would degrade, then OOM kill.

**The Debug Process**:
```
Symptom: App crashes during generation
Initial theory: Model too large
Test: Monitor memory - grows unbounded
Realization: KV cache tensors never closed
Root cause: 64 tensors × 200 iterations = 12,800 leaked tensors
```

**The Fix**: Close old cache after getting new one, not before:

```kotlin
// WRONG: Old cache freed before new one created
kvCache?.values?.forEach { it.close() }
kvCache = result.presentKeyValues

// CORRECT: Get new cache first, then free old
val oldCache = kvCache
kvCache = result.presentKeyValues
if (oldCache != null) {
    oldCache.values.forEach { it.close() }
}
```

One line, critical difference. Mobile development requires this level of memory discipline.

### Challenge 5: When to Stop Generating

**The Problem**: The model doesn't naturally emit EOS (end-of-sequence) tokens. It'll generate forever, or until it starts looping. Initial approaches failed:

```
Attempt 1: Stop after N tokens based on prompt length
Result: "Tell me a story" stopped at 50 tokens mid-sentence

Attempt 2: Stop on sentence boundaries
Result: "What's the capital of France?" gave 5 paragraphs of history

Attempt 3: Consecutive repetition detection (buggy)
Result: Stopped immediately (was comparing token with itself)
```

**The Working Solution**: Multi-layered approach:

```kotlin
// 1. EOS tokens (if model emits them)
if (tokenId in listOf(2, 32000, 32007)) break

// 2. Consecutive repetition (same token 10+ times)
if (tokenId == previousToken) {
    consecutiveCount++
    if (consecutiveCount >= 10) break
}

// 3. N-gram repetition (pattern detection)
if (last4Tokens appeared 4+ times in recent 20 tokens) {
    ngramRepetitionCount++
    if (ngramRepetitionCount >= 3) break
}

// 4. Safety limit (prevent infinite loops)
if (tokenCount >= 400) break

// 5. Manual stop button (user control)
// Implemented in UI via coroutine cancellation
```

The key insight: don't use heuristics based on prompt length or sentence count. Let the model generate naturally, detect when it's looping, give users manual control.

## NNAPI: Mobile Hardware Acceleration

Modern Android devices include NPUs (Neural Processing Units). ONNX Runtime supports NNAPI to leverage them:

```kotlin
val sessionOptions = OrtSession.SessionOptions().apply {
    addNnapi()  // One line enables NPU acceleration
}
```

Results:
- CPU only: ~800ms per token
- NNAPI (NPU): ~200ms per token
- Speedup: 4x from hardware acceleration

Combined with KV cache (6x speedup), total improvement: 24x faster than naive CPU implementation.

## Production Metrics

After fixing all issues, here's what production looks like:

```
Test: "Tell me a short story"
Generated: 311 tokens in 78 seconds
Speed: ~250ms per token (4 tokens/second)
Quality: Coherent narrative with plot, characters, dialogue
Stopping: Natural (n-gram repetition detected)

Example output:
"Certainly! Here's a short story for you:

Once upon a time, in a peaceful village nestled between lush green hills,
there lived a young girl named Lily. She had a kind heart and a curious mind.
One day, while exploring the nearby forest, she discovered a mysterious,
ancient artifact - a beautifully crafted golden amulet...

[Story continues for 311 tokens with coherent plot about village elders,
a historian named Elara, and a wise decision about using the amulet]"
```

No crashes, stable memory, proper formatting, natural language.

## Key Learnings: Edge MLOps is Different

### 1. Dependencies Have Real Cost

Every library adds APK size, compilation time, and complexity. The ONNX Runtime GenAI library would have been convenient but adds 50MB+ to the app. Building a custom tokenizer took longer but resulted in:
- 3.5MB tokenizer.json (parsed once)
- 350 lines of code
- Zero runtime dependencies
- Full control over behavior

Worth it.

### 2. Memory Management is Critical

Desktop ML can allocate freely. Mobile ML requires discipline:
- Close tensors when done
- Monitor memory usage continuously
- Test on real devices (emulators lie)
- Profile with Android Studio memory profiler

One memory leak kills the app after 2 minutes.

Testing on multiple devices was crucial. I gathered whatever Android devices I could find around my flat - an old S10+ from my mom, a Pixel 7a, and several others. Each device behaved differently: different NPU capabilities, different memory constraints, different thermal throttling thresholds. What worked smoothly on one would crash on another. Edge ML isn't just about writing code that works on your development device - it's about writing code that works on the chaos of real-world hardware.

### 3. Performance is Non-Negotiable

Users won't wait 30 seconds per token. Edge ML requires:
- Hardware acceleration (NNAPI, GPU delegates)
- Algorithmic optimization (KV cache)
- Quantization (INT4, INT8)
- Memory-mapped loading
- Careful tensor management

All of these together, not just one.

### 4. From Scratch > Dependencies (Sometimes)

Building the tokenizer from scratch taught me:
- How BPE actually works
- Why SentencePiece uses ▁ for spaces
- How to handle byte tokens
- What merge rules do
- How vocab maps to IDs

That knowledge proved invaluable when debugging. With a library, I'd have been stuck.

### 5. User Control Matters

ML models are unpredictable. Give users control:
- Manual stop button (model won't always stop itself)
- Adjustable parameters (even if hidden in settings)
- Clear feedback (show generation progress)
- Graceful degradation (what happens when it fails?)

## What's Next

The conversational AI branch (Phi-3) is production-ready. The document parsing branch (Granite Docling) is experimental. Future work:

**Conversational AI:**
- Temperature/top-p sampling (currently greedy)
- Conversation history persistence
- Multiple chat sessions
- Model parameter tuning UI

**Document Parsing:**
- OCR accuracy improvements
- Table extraction
- Multi-page processing
- Export to structured formats

**Integration:**
- Bring back Android Auto support
- Speech-to-text with Whisper
- Text-to-speech synthesis
- Voice-controlled document queries

**Research:**
- Model distillation for smaller models
- LoRA fine-tuning on-device
- Quantization experiments (INT2?)
- Multi-model orchestration

## Conclusion

Building EdgeMind from scratch was challenging but rewarding. The project evolved through three major pivots, each one focusing the scope and clarifying the technical challenges. What started as an ambitious Android Auto assistant became a deep dive into edge MLOps: quantization, tokenization, hardware acceleration, memory management, and production deployment.

The result: a production-ready LLM inference system running entirely on Android, generating coherent text at 4 tokens/second, with proper memory management, hardware acceleration, and user control. All from scratch, all local, all private.

The code is open source: [github.com/IgnacioLD/edgemind](https://github.com/IgnacioLD/edgemind)

The journey continues. Edge AI is just getting started.

## Technical Specifications

**Model**: Phi-3 mini INT4 (3.8B parameters, 2.6GB)
**Runtime**: ONNX Runtime 1.19.2 with NNAPI
**Tokenizer**: Custom SentencePiece BPE (32,064 vocab)
**Performance**: ~250ms per token (4 tokens/sec)
**Acceleration**: NNAPI (NPU/TPU/DSP)
**Architecture**: Clean Architecture (MVVM + Domain/Data)
**Language**: Kotlin with Jetpack Compose
**Status**: Production ready
