# Context-Aware Pseudo-AR Weather Data Application

# Project Overview
This project is a **browser-based pseudo-augmented reality (AR) application** that visualises real-time weather data within a live camera view. It combines Three.js, browser APIs (camera + geolocation), and an Express.js server to create a lightweight, accessible AR-like experience without requiring WebXR or native mobile frameworks.


# Key Features
* Live Camera Integration 
* Geolocation-Based Data
* Real-Time Weather Data(Open Metro API)
* 3D Visualisation with Three.js
* Camera Switching Function - if device supported
* Lightweight Web Deployment - Runs entirely in the browser—no installation required.



# Getting Started
1.Either follow the render link option below
Reder Test URL:
https://web-ar-weather-data-app.onrender.com   
Note for testers: Please contact the student/writer via university email to request deployment of the test server.



2. Or use Individual setup to test 
Install Dependencies
```bash
npm install
```

Running on a Server

```bash
node server.js
```
You may need to use HTTPS or localhost for camera access depending on your browser.



# Permissions Required
The application will request:
* Camera Access – to display the live video feed
* Location Access – to retrieve your coordinates for weather data

Both permissions must be granted for full functionality.


# Technologies Used
* JavaScript
* Three.js
* Node.js / Express
* Open-Meteo API
* HTML5 / CSS
* Web APIs:
  * `getUserMedia`
  * `navigator.geolocation`


# Limitations
* No spatial tracking (not true AR)
* 3D objects are not anchored in the real world
* Limited interaction (no object manipulation)
* Basic data visualisation (text-based)



# Future Improvements
* Integration with **WebXR** for true AR
* Enhanced **data visualisation (colour, animation)**
* Interactive UI elements (touch/gesture controls)
* Performance optimisation for mobile devices



# Academic Context
This project was developed as part of a research-focused exploration into:

* Web-based AR systems
* Environmental data visualisation
* Context-aware computing

It demonstrates the trade-offs between:

* Accessibility vs realism
* Simplicity vs immersion



# License
This project is for educational and research purposes only .



# Author
[Ashford.C]
[Bangor University 2026]


