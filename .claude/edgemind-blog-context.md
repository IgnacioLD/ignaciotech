# EdgeMind Blog Post - Writing Context

## Current Status

**File Location**: `content/blog/edgemind-edge-llm-inference.md`

**Status**: First draft complete, published to ignacio.tech

**Word Count**: ~3,500 words

**Read Time**: 12 min

## Project Background

### What is EdgeMind?

EdgeMind is an experimental on-device LLM inference system for Android. Key points:

- Started as Android Auto voice assistant project
- Pivoted 3 times to focus scope
- Now two separate experimental branches:
  1. **Conversational AI**: Phi-3 mini (3.8B params, INT4, 2.6GB)
  2. **Document Parsing**: Granite Docling (258M params)
- Focus: Edge MLOps from scratch
- GitHub: https://github.com/IgnacioLD/edgemind

### Project Journey (3 Pivots)

1. **Initial Vision**: Android Auto voice assistant with Whisper + Llama + TTS
2. **First Pivot**: Focus on core LLM inference, defer Android Auto
3. **Second Pivot**: Split into two branches (document vs. chat)

### Technical Achievements

**Core Implementation:**
- Custom SentencePiece BPE tokenizer (350 lines, 32k vocab, 61k merges)
- KV cache implementation (6x speedup, O(n²) → O(n))
- NNAPI hardware acceleration (4x speedup from NPU)
- Memory leak fixes (proper tensor lifecycle management)
- Smart stopping criteria (n-gram detection, user control)

**Performance:**
- 4 tokens/second throughput
- ~250ms per token average
- Tested: 311 token story generation in 78 seconds
- Stable memory (~500MB runtime)
- No crashes

**Testing Environment:**
- Multiple devices: S10+ (from mom), Pixel 7a, various others found around flat
- Real-world hardware diversity testing
- Different NPU capabilities, memory constraints, thermal profiles

## Blog Post Structure (Current)

### Section 1: Introduction
- Hook about learning from scratch
- Project evolution overview
- Three pivots summary

### Section 2: The Journey - Three Pivots
- Initial vision (Android Auto)
- First pivot (focus on core tech)
- Second pivot (two branches)

### Section 3: Technical Deep Dive
Each challenge has:
- The Problem
- The Solution/Implementation
- Code snippets
- Results/metrics

**Covered challenges:**
1. Model selection and quantization
2. Tokenizer nightmare (custom BPE)
3. KV cache (6x speedup)
4. Memory leaks on mobile
5. When to stop generating

### Section 4: NNAPI Hardware Acceleration
- NPU utilization
- Performance metrics
- Combined speedup (24x total)

### Section 5: Production Metrics
- Test results (311 token story)
- Example output
- Quality assessment

### Section 6: Key Learnings
5 main learnings:
1. Dependencies have real cost
2. Memory management is critical (includes multi-device testing story)
3. Performance is non-negotiable
4. From scratch > dependencies (sometimes)
5. User control matters

### Section 7: What's Next
- Short term features
- Medium term (speech integration)
- Long term (research directions)

### Section 8: Conclusion
- Summary of journey
- Results achieved
- Call to action (GitHub link)

### Section 9: Technical Specifications
- Bullet list of tech specs

## Writing Style Guidelines

**Tone:**
- Professional and technical
- Personal where appropriate (first person OK)
- Honest about experiments (not production claims)
- Educational focus

**Rules:**
- NO EMOJIS (user explicitly requested professional tone)
- Use code blocks for technical details
- Include specific metrics and numbers
- Be honest about failures and debugging process
- Show real code snippets

**Voice:**
- "I built..." not "We built..."
- "The project demonstrates..." not "This proves..."
- "Experimental" not "production-ready"
- "Research" and "exploration" framing

## Key Technical Details

### Model
- Phi-3 mini INT4
- 3.8B parameters
- Quantized to 2.6GB (from 7.6GB FP32)
- Microsoft ONNX export with RTN quantization

### Tokenizer
```kotlin
class Phi3BPETokenizer(context: Context) {
    private val vocab: Map<String, Int>              // 32,000 tokens
    private val merges: Map<Pair<String, String>, Int>  // 61,249 rules
    private val specialTokens: Map<String, Int>      // 13 special
    private val vocabReverse: Map<Int, String>       // reverse lookup
}
```

### KV Cache
- 32 layers × 2 (key + value) = 64 tensors per iteration
- Cache reused across tokens
- Critical fix: close old cache AFTER getting new one
- Memory leak: 64 tensors × 200 iterations = 12,800 leaked tensors (before fix)

### Stopping Criteria
1. EOS tokens (2, 32000, 32007)
2. Consecutive repetition (10+ same token)
3. N-gram repetition (4-grams 4+ times, 5-grams 3+ times)
4. Safety limit (400 tokens)
5. Manual stop button (coroutine cancellation)

### Performance Metrics
```
Without KV cache:
Token 1:  800ms
Token 10: 2.5s
Token 50: 30s+

With KV cache:
Token 1:  200ms
Token 10: 180ms
Token 50: 150ms

With NNAPI + KV cache:
Average: 250ms per token
Throughput: 4 tokens/second
```

## Potential Additions/Edits

### Could Add:
- More detail on BPE algorithm implementation
- Debugging stories (specific bugs encountered)
- Comparison with other approaches (TFLite, etc.)
- More code snippets from actual implementation
- Performance comparison charts/tables
- Future research directions in more detail

### Could Expand:
- Multi-device testing section (more detail on device differences)
- Memory profiling process
- NNAPI integration challenges
- Chat template implementation
- Streaming generation details

### Could Refine:
- Code snippets (ensure they're accurate and helpful)
- Technical accuracy (verify all claims)
- Flow between sections
- Conclusion strength

## Related Files

**Project Page**: `content/projects/edgemind.md`
- Companion piece with different focus
- More structured overview
- Development process emphasis
- Also featured

**SVG Image**: `static/images/projects/edgemind.svg`
- Custom-designed neural network visualization
- Mobile device with NPU indicator
- Used for both blog and project

**Source Code**: github.com/IgnacioLD/edgemind
- Main implementation at: `android/app/src/main/kotlin/com/localai/assistant/`
- Key files:
  - `Phi3BPETokenizer.kt` (tokenizer)
  - `ONNXModelWrapper.kt` (ONNX runtime)
  - `ModelRepositoryImpl.kt` (generation loop)
  - `ChatViewModel.kt` (UI state)
  - `ChatScreen.kt` (Compose UI)

**Documentation**: `INFERENCE_FINDINGS.md`
- Comprehensive technical documentation
- All issues and solutions
- Production metrics
- Reference for blog accuracy

## Hugo Front Matter

```yaml
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
```

## Target Audience

**Primary**: Android developers interested in ML/AI
**Secondary**: ML engineers exploring edge deployment
**Tertiary**: Students learning about LLMs and optimization

**Assumes knowledge of:**
- Android development basics
- Basic ML concepts (models, inference, tokenization)
- Kotlin programming

**Explains from scratch:**
- BPE tokenization
- KV caching
- NNAPI acceleration
- Edge-specific optimizations

## SEO Keywords

- Android LLM inference
- Edge AI
- On-device machine learning
- NNAPI
- ONNX Runtime Android
- Mobile AI optimization
- BPE tokenization
- KV cache
- Edge MLOps

## Next Steps for Editing

If continuing to work on this blog post:

1. **Read the published version** to get full context
2. **Check INFERENCE_FINDINGS.md** for technical accuracy
3. **Review source code** if adding more implementation details
4. **Maintain professional tone** (no emojis, honest about experimental nature)
5. **Add value** don't just expand for length
6. **Keep it technical** but accessible
7. **Include real metrics** and code where helpful

## Contact for Questions

Blog is on ignacio.tech (Hugo static site)
Repository: github.com/IgnacioLD/ignaciotech
Project: github.com/IgnacioLD/edgemind
