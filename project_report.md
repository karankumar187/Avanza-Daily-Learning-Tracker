# Project Report: Avanza - Daily Learning Tracker

## 1. Executive Summary
**Avanza** is a full-stack, AI-powered daily learning management system designed to enhance productivity and learning consistency. Built with the MERN stack (React, Node.js, Express, MongoDB), it emphasizes a seamless user experience, intelligent insights, and secure data handling to help users track and achieve their learning objectives.

## 2. Core Features
- **Task & Schedule Management**: Users can create, view, and complete tasks with time-spent tracking. Learning objectives are categorized with priorities and color coding.
- **Analytics & Tracking**: Tracks per-objective completion streaks, weekly progress bar charts, and time summaries.
- **AI Integration**: Generates personalized weekly schedules via HuggingFace LLM and features a context-aware AI chat assistant.
- **Notifications**: Real-time reminders and scheduled automated alerts for pending tasks.
- **Security**: Features robust API security (Helmet, NoSQL injection prevention, XSS sanitization) and OAuth/JWT authentication.

## 3. Technology Stack

| Layer | Technologies | Layer | Technologies |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts | **AI/External** | HuggingFace Inference SDK, Passport.js |
| **Backend** | Node.js, Express.js, node-cron | **Database** | MongoDB + Mongoose ODM |
| **Security** | helmet, mongo-sanitize, xss-clean, bcrypt | **Auth** | JWT, Google/GitHub OAuth |

## 4. System Architecture
The application uses a standard Client-Server architecture utilizing a modern stack, optimized with Vite for high performance.

```mermaid
flowchart TD
    subgraph "Client Tier"
        Frontend["React + Vite SPA"]
    end

    subgraph "Application Tier"
        API["Express.js API"]
    end

    subgraph "Data Tier"
        DB[("MongoDB Atlas")]
    end

    subgraph "External Services"
        Auth["Google/GitHub OAuth"]
        HF["HuggingFace AI"]
    end

    Frontend <-->|"REST/JSON"| API
    API <-->|"Mongoose/MQL"| DB
    API -->|"OAuth Tokens"| Auth
    API -->|"Prompts"| HF
```

## 5. Data Flow Diagrams (DFD)

### 5.1 Context Diagram (Level 0 DFD)
```mermaid
flowchart LR
    User([User]) -- "Auth/Tasks/Prompts" --> System((Avanza\nSystem))
    System -- "Dashboard/Alerts" --> User
    
    System -- "OAuth Req" --> OAuth([OAuth Providers])
    OAuth -- "Profile Data" --> System
    
    System -- "Prompt" --> HuggingFace([HuggingFace AI])
    HuggingFace -- "Schedule/Response" --> System
```

### 5.2 Logical Data Flow (Level 1 DFD)
```mermaid
flowchart TD
    User([User])
    
    P1((1. Auth))
    P2((2. Schedule Mgt))
    P3((3. Analytics))
    P4((4. AI Services))
    P5((5. Alerts))
    
    D1[(D1: Users)]
    D2[(D2: Goals/Tasks)]
    D3[(D3: Progress)]
    D4[(D4: Alerts)]
    
    User <--> P1
    P1 <--> D1
    
    User <--> P2
    P2 <--> D2
    P2 --> D3
    
    User --> P3
    D2 --> P3
    D3 --> P3
    
    User <--> P4
    D2 --> P4
    
    User <--> P5
    P5 <--> D4
    D2 --> P5
```

## 6. Database Schema & Security Overview
- **Collections**: `Users` (profiles/preferences), `LearningObjectives` (goals), `DailyProgress` (logs/streaks), `Schedules` (AI output), `Notifications`, and `Notes`.
- **Security**: Hardened API gateway with `express-mongo-sanitize`, `xss-clean`, robust rate limiting (10 req/15 min on auth), and prompt injection guards.
