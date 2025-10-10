# Continue Writing EdgeMind Blog Post

## Quick Start

To continue editing the EdgeMind blog post with Claude Code:

```bash
cd ~/projects/ignaciotech
claude "I want to continue working on the EdgeMind blog post. Read .claude/edgemind-blog-context.md for full context."
```

## Files to Work With

**Blog Post**: `content/blog/edgemind-edge-llm-inference.md`
**Context Doc**: `.claude/edgemind-blog-context.md` (comprehensive background)
**Project Page**: `content/projects/edgemind.md` (related content)

## Current Status

- ✅ First draft complete (3,500 words, 12 min read)
- ✅ Published to ignacio.tech
- ✅ Featured on homepage
- 🔄 Available for refinement/expansion

## Key Rules

1. **NO EMOJIS** - Professional tone only
2. **Experimental framing** - Not "production-ready"
3. **Honest about failures** - Show debugging process
4. **Technical depth** - Include code, metrics, specifics
5. **First person OK** - "I built..." not "We built..."

## What You Can Do

### Expand Sections
- Add more code snippets
- Deeper technical explanations
- More debugging stories
- Performance comparisons

### Add New Sections
- BPE algorithm deep dive
- NNAPI integration challenges
- Device-specific optimizations
- Future research directions

### Refine Content
- Improve flow between sections
- Strengthen conclusion
- Add visual diagrams (if helpful)
- Verify technical accuracy

## Preview Locally

```bash
cd ~/projects/ignaciotech
hugo server
# Open http://localhost:1313
```

## Publish Changes

```bash
git add content/blog/edgemind-edge-llm-inference.md
git commit -m "Update EdgeMind blog post: [describe changes]"
git push origin main
```

## Reference Material

- **Source Code**: github.com/IgnacioLD/edgemind
- **Tech Docs**: `~/projects/local-llm-android-auto/INFERENCE_FINDINGS.md`
- **Implementation**: `~/projects/local-llm-android-auto/android/app/src/main/kotlin/`

## Context File Contains

- Full project background
- Technical achievements
- Current blog structure
- Writing style guidelines
- Code snippets and metrics
- Potential additions
- SEO keywords
- Target audience

Read `.claude/edgemind-blog-context.md` for complete details.
