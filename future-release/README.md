# Future Release: AI Analysis Feature

This folder contains the AI-powered image analysis feature planned for a future release of Cleanism.

## Overview
The AI analysis feature uses OpenAI's GPT-4V to automatically:
- Analyze before/after photos of cleaning tasks
- Generate task names based on the image content
- Provide context-aware cleaning tips

## Setup Instructions for Next Release

### 1. Environment Configuration
Create a `.env` file in the project root with:
```
OPENAI_API_KEY=sk-your-api-key-here
```

The API key has already been provided. Store it securely in your environment.

### 2. Files to Re-integrate
- `AIService.swift` - Main AI service for image analysis and task generation
- Views that call AI:
  - `CameraView.swift` - analyzeImage() call (line ~216)
  - `AddChoreView.swift` - generateTaskFromDescription() call (line ~329)

### 3. Implementation Checklist
- [ ] Add OPENAI_API_KEY to `.env` file
- [ ] Add `.env` to Xcode project build target
- [ ] Re-enable AIService imports in CameraView and AddChoreView
- [ ] Re-enable try/catch blocks for AI analysis
- [ ] Test image analysis with before photos
- [ ] Test task generation from text description
- [ ] Handle API errors gracefully

### 4. Key Code References

**CameraView.swift** - Image analysis:
```swift
let result = try await AIService.analyzeImage(base64Image: base64, contextDescription: contextDescription)
```

**AddChoreView.swift** - Text-to-task generation:
```swift
let result = try await AIService.generateTaskFromDescription(description: description, area: area)
```

### 5. Error Handling Notes
- API rate limits: Implement exponential backoff
- Missing API key: Already handled, shows user-friendly error
- Network failures: Add retry logic with user feedback
- Token validation: Verify API key before making requests

## Current Status
- ✅ AIService.swift fully functional
- ✅ Error handling implemented
- ✅ Debugging logs in place
- ⏸️ Feature disabled in main app (v1.0)
- ⏸️ Awaiting future release cycle

## Related Environment Variables
- `OPENAI_API_KEY` - Required for AI features
- Keychain storage recommended for production deployments

## Testing
Use the debug logs in EnvConfig.swift to verify API key loading:
```
DEBUG EnvConfig: get(OPENAI_API_KEY) = ***
```

---
Last Updated: April 2026
