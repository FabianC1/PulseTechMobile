# PulseTechMobile

An Android mobile application developed using React Native and Expo.

## Project Overview
PulseTechMobile is the mobile extension of the PulseTech healthcare platform. Designed for daily clinical and patient use, the app provides real-time features such as medication tracking, appointment scheduling, secure messaging, and medical record viewing — all customized based on user roles (Doctor, Patient, Admin).

## Features and Implementation

### General Architecture
- Built with **React Native + TypeScript**, using **Expo** for rapid development and testing.
- Modular folder structure:
  - `screens/`: Full-view pages (e.g., Medications, Appointments, Messages)
  - `components/`: Reusable UI elements (e.g., MedicationCard, MessageBubble)
  - `services/`: API handlers and notification logic
  - `context/`: Global state with role-based access
  - `navigation/`: Stack + Drawer navigation with conditional routing

### Authentication & Role-Based Navigation
- Authenticated via backend `/login` endpoint
- Global context stores user role
- Drawer and stack navigators render different screens based on role (e.g. patient vs. doctor)

### Key Screens & Features

#### Appointments
- Patients request appointments via a form
- Doctors approve and mark as completed
- Features:
  - Scrollable appointment list
  - Button state management
  - 24hr prior notifications via `NotificationService`

#### Medications
- Medication cards display:
  - Name, dosage, diagnosis, frequency
  - Countdown to next dose
- Role-specific features:
  - Doctors prescribe via dynamic form
  - Patients mark as taken or system auto-logs missed
- Hidden local time simulation for testing (+10m, +1h, +4h, Reset)

#### Messaging
- Real-time chat with auto-scrolling UI
- Role-colored chat bubbles with timestamps
- Attach latest medical record to messages
- Modal-based viewing of attached records

#### Medical Records
- View personal medical history, lifestyle data, and prescriptions
- Scrollable layout with sectioned cards
- Galaxy Watch 6 integration placeholder added

### Notifications
- Medication reminders sent at `timeToTake`
- Appointment reminders sent 24 hours in advance
- Centralized in `NotificationService.ts`
- Time simulation affects local state (not backend)

### Custom UI/UX Components
- Role-filtered drawer navigation
- Custom alert system
- Pull-to-refresh
- Modals and keyboard-aware layouts

## Tech Stack
- React Native (with Expo)
- TypeScript
- Axios
- React Navigation
- React Context API
- Android Emulator / Physical Devices

## How to Run
1. Clone the repository.
2. Install dependencies:  
   `npm install`
3. Start Expo:  
   `npx expo start`
4. Scan the QR code with Expo Go or run on Android Emulator.

## Notes
PulseTechMobile was developed to meet the final year dissertation goals (Objectives 2–6) and represents a significant evolution from static healthcare apps. It includes over 600 commits, reflecting continuous testing, refinement, and real-world UX consideration.

