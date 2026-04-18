# Architecture

## Overview

First Job Navigator is a full stack web app built with a React + TypeScript frontend and a Django REST Framework backend, backed by MySQL. It serves users by helping them understand their finances when starting work through salary calculation, budgeting, pension forecasting, move-out readiness analysis, and accessing learning resources.

---

## Full System Architecture

```mermaid
flowchart TD
    U[User]

    FE[Frontend
    - Landing / Public Pages
    - Auth UI
    - Dashboard
    - Salary Simulator UI
    - Budget Planner UI
    - Pension Projection UI
    - Move-Out Readiness UI
    - Learning Hub UI
    - AI Chat UI
    - Service Layer / API Client]

    BE[Backend
    accounts:
    - register/login/logout
    - current user/profile
    - password reset

    calculators:
    - salary logic
    - tax/NI/student loan rules
    - saved salary calculations

    budget:
    - budgets
    - categories
    - transactions
    - savings goals
    - alerts
    - financial snapshot score

    pension:
    - projection logic
    - growth scenarios
    - inflation adjustment

    move_out:
    - postcode lookup
    - rent data
    - crime data
    - affordability/readiness score
    - property listings
    - saved plans

    learning:
    - articles
    - quizzes
    - article completion
    - quiz progress
    - learning dashboard

    AI_chatbot:
    - chat sessions
    - messages
    - Groq integration]

    DB[(MySQL Database
    - users
    - saved salary results
    - budgets/categories/transactions
    - savings goals
    - pension records
    - learning progress
    - move-out plans
    - chat sessions/messages)]

    EXT[External APIs
    - Postcodes.io
    - ONS
    - Police API
    - Rightmove via Apify
    - Groq]

    U --> FE
    FE --> BE
    BE --> DB
    BE --> EXT