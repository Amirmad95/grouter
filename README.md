# GeminiKey Router v1.0

A professional, high-performance API key router and manager for Google Gemini, designed for rapid deployment in Termux or local environments.

## Features

- **Intelligent Routing**: Uses a weighted least-used algorithm to balance traffic across multiple Gemini API keys.
- **Circuit Breaker**: Automatically detects rate limits (429) or consecutive failures and places nodes into a cooling state.
- **Auto-Switch Engine**: Optional engine that deactivates keys at 90% usage to prevent total tier exhaustion.
- **Neural Link (Chat History)**: Maintains contextual memory (last 10 turns) for sophisticated multi-turn conversations.
- **Persistence**: All keys, counters, and history are stored locally in the browser/client environment.
- **Cyberpunk UI**: High-tech terminal aesthetic optimized for mobile and desktop viewports.

## Technical Specs

- **Frontend**: React + Tailwind CSS v4 + Framer Motion
- **State Management**: Custom React Hooks + LocalStorage
- **Icons**: Lucide React
- **Typography**: JetBrains Mono & Inter

## Setup Instructions

1. **Node Injection**: Go to the **Node_Vault** tab.
2. **Key Sync**: Enter your Gemini API key (from Google AI Studio).
3. **Limit Config**: Set your RPM (Requests Per Minute) limits.
4. **Link Establishment**: Switch to **Neural_Link** and begin broadcasting signals.

---
*Notice: This is a frontend-only application designed for maximum portability.*
