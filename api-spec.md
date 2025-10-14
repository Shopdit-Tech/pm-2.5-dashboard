# PM2.5 Air Quality Monitoring System - API Specification

**Version:** 1.0  
**Last Updated:** January 14, 2025  
**Base URL:** `https://api.example.com/v1`

---

## 🔐 Authentication

All API requests (except login) require JWT authentication token in header:
```
Authorization: Bearer <token>
```

### 1.1 Login
```
POST /auth/login
```
**Description:** User login and get JWT token

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "admin | user"
    }
  }
}
```

### 1.2 Logout
```
POST /auth/logout
```
**Description:** Invalidate user token

### 1.3 Get Current User
```
GET /auth/me
```
**Description:** Get current logged-in user info

---

## 📍 Sensors

### 2.1 List All Sensors
```
GET /sensors
```
**Description:** Get list of all sensors (static and mobile)

**Query Parameters:**
- `type` (optional): `indoor | outdoor | mobile`
- `status` (optional): `online | offline`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "indoor | outdoor | mobile",
      "location": {
        "lat": 13.7563,
        "lng": 100.5018
      },
      "status": "online | offline",
      "lastUpdate": "2025-01-14T10:15:25Z"
    }
  ]
}
```

### 2.2 Get Single Sensor
```
GET /sensors/:id
```
**Description:** Get detailed information for a specific sensor

### 2.3 Update Sensor (Admin Only)
```
PUT /sensors/:id
```
**Description:** Update sensor configuration

**Request Body:**
```json
{
  "name": "string (optional)",
  "type": "string (optional)",
  "location": {
    "lat": "number (optional)",
    "lng": "number (optional)"
  }
}
```

### 2.4 Create Sensor (Admin Only)
```
POST /sensors
```
**Description:** Create a new sensor

### 2.5 Delete Sensor (Admin Only)
```
DELETE /sensors/:id
```
**Description:** Delete a sensor

---

## 📊 Sensor Readings

### 3.1 Get Sensor Readings
```
GET /sensors/:id/readings
```
**Description:** Get time-series readings for a sensor

**Query Parameters:**
- `startDate`: ISO 8601 datetime (required)
- `endDate`: ISO 8601 datetime (required)
- `interval`: `5min | 15min | 1hour | 1day` (optional, default: 5min)

**Response:**
```json
{
  "success": true,
  "data": {
    "sensorId": "string",
    "sensorName": "string",
    "readings": [
      {
        "timestamp": "2025-01-14T10:00:00Z",
        "pm1": 12.5,
        "pm25": 25.3,
        "pm10": 45.8,
        "co2": 450,
        "temperature": 28.5,
        "humidity": 65,
        "tvoc": 250
      }
    ]
  }
}
```

### 3.2 Get Latest Reading
```
GET /sensors/:id/latest
```
**Description:** Get most recent reading for a sensor

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-01-14T10:15:25Z",
    "pm1": 12.5,
    "pm25": 25.3,
    "pm10": 45.8,
    "co2": 450,
    "temperature": 28.5,
    "humidity": 65,
    "tvoc": 250
  }
}
```

### 3.3 Post Sensor Reading (IoT Device)
```
POST /sensors/:id/readings
```
**Description:** Submit new sensor reading (from IoT device)

**Request Body:**
```json
{
  "timestamp": "2025-01-14T10:15:25Z",
  "pm1": 12.5,
  "pm25": 25.3,
  "pm10": 45.8,
  "co2": 450,
  "temperature": 28.5,
  "humidity": 65,
  "tvoc": 250
}
```

### 3.4 Get Bulk Readings
```
POST /readings/bulk
```
**Description:** Get readings for multiple sensors at once

**Request Body:**
```json
{
  "sensorIds": ["id1", "id2", "id3"],
  "startDate": "2025-01-14T00:00:00Z",
  "endDate": "2025-01-14T23:59:59Z",
  "interval": "1hour"
}
```

---

## 🚗 Mobile Sensors & Routes

### 4.1 Get Mobile Sensor Route
```
GET /mobile-sensors/:id/route
```
**Description:** Get GPS route data for mobile sensor

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format (optional, default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "sensorId": "string",
    "date": "2025-01-14",
    "route": [
      {
        "timestamp": "2025-01-14T08:00:00Z",
        "location": {
          "lat": 13.7563,
          "lng": 100.5018
        }
      }
    ]
  }
}
```

### 4.2 Get Mobile Sensor Readings
```
GET /mobile-sensors/:id/readings
```
**Description:** Get readings along mobile route

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format (optional)
- `startTime`: Time in HH:MM format (optional)
- `endTime`: Time in HH:MM format (optional)

---

## 👥 User Management (Admin Only)

### 5.1 List All Users
```
GET /users
```
**Description:** Get list of all users (admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "admin | user",
      "createdAt": "2025-01-14T10:15:25Z"
    }
  ]
}
```

### 5.2 Create User
```
POST /users
```
**Description:** Create new user (admin only)

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "role": "admin | user"
}
```

### 5.3 Update User
```
PUT /users/:id
```
**Description:** Update user details (admin only)

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)",
  "role": "string (optional)"
}
```

### 5.4 Delete User
```
DELETE /users/:id
```
**Description:** Delete user (admin only)

---

## ⚙️ Configuration (Admin Only)

### 6.1 Get Air Quality Thresholds
```
GET /config/thresholds
```
**Description:** Get color thresholds for all parameters

**Response:**
```json
{
  "success": true,
  "data": {
    "pm25": [
      {
        "level": "good",
        "color": "#52c41a",
        "min": 0,
        "max": 25
      },
      {
        "level": "moderate",
        "color": "#faad14",
        "min": 26,
        "max": 50
      }
    ],
    "co2": [...],
    "temperature": [...]
  }
}
```

### 6.2 Update Parameter Thresholds
```
PUT /config/thresholds/:parameter
```
**Description:** Update thresholds for a specific parameter (admin only)

**Request Body:**
```json
{
  "ranges": [
    {
      "level": "good",
      "color": "#52c41a",
      "min": 0,
      "max": 25
    }
  ]
}
```

### 6.3 Get Sensor Configurations
```
GET /config/sensors
```
**Description:** Get custom sensor configurations (names, types)

### 6.4 Update Sensor Configuration
```
PUT /config/sensors/:id
```
**Description:** Update sensor configuration (admin only)

---

## 📈 Analytics

### 7.1 Dashboard Summary
```
GET /analytics/summary
```
**Description:** Get summary statistics for dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSensors": 28,
    "onlineSensors": 25,
    "averagePM25": 32.5,
    "averageCO2": 480,
    "averageTemperature": 28.5,
    "averageHumidity": 65
  }
}
```

### 7.2 Historical Trends
```
GET /analytics/trends
```
**Description:** Get historical trend data for analytics charts

**Query Parameters:**
- `sensorIds`: Comma-separated sensor IDs (required)
- `parameter`: `pm1 | pm25 | pm10 | co2 | temperature | humidity | tvoc` (required)
- `timeRange`: `1h | 8h | 24h | 48h | 7d | 30d` (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sensorId": "string",
      "sensorName": "string",
      "parameter": "pm25",
      "data": [
        {
          "timestamp": "2025-01-14T10:00:00Z",
          "value": 25.3
        }
      ],
      "statistics": {
        "min": 12.5,
        "max": 45.8,
        "average": 28.3
      }
    }
  ]
}
```

### 7.3 Compare Sensors
```
POST /analytics/compare
```
**Description:** Compare multiple sensors over time

**Request Body:**
```json
{
  "sensorIds": ["id1", "id2", "id3"],
  "parameter": "pm25",
  "startDate": "2025-01-13T00:00:00Z",
  "endDate": "2025-01-14T23:59:59Z"
}
```

---

## 📥 Data Export

### 8.1 Export to CSV
```
GET /export/csv
```
**Description:** Export sensor data as CSV file

**Query Parameters:**
- `sensorIds`: Comma-separated sensor IDs (required)
- `startDate`: ISO 8601 datetime (required)
- `endDate`: ISO 8601 datetime (required)
- `parameters`: Comma-separated parameters (optional, default: all)

**Response:** CSV file download

**Example:**
```
GET /export/csv?sensorIds=sensor1,sensor2&startDate=2025-01-13T00:00:00Z&endDate=2025-01-14T23:59:59Z&parameters=pm25,co2
```

---

## 🔄 Real-Time Updates (Optional)

### WebSocket Connection
```
WS /ws/sensors
```
**Description:** WebSocket for real-time sensor updates

**Message Format:**
```json
{
  "type": "reading",
  "sensorId": "string",
  "data": {
    "timestamp": "2025-01-14T10:15:25Z",
    "pm25": 25.3
  }
}
```

**Alternative:** Poll `/sensors/:id/latest` every 30 seconds

---

## 📝 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Success message (optional)",
  "timestamp": "2025-01-14T10:15:25Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": "2025-01-14T10:15:25Z"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Missing or invalid authentication token
- `FORBIDDEN` - Insufficient permissions (admin required)
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request parameters
- `SERVER_ERROR` - Internal server error

---

## 🔒 Security & Access Control

### Authentication
- JWT tokens with 24-hour expiry
- Tokens should be refreshed before expiry
- Store tokens securely (httpOnly cookies or secure storage)

### Authorization Levels
1. **Public** - No authentication required
2. **User** - Requires authentication
3. **Admin** - Requires authentication + admin role

### Endpoint Access Matrix

| Endpoint | Public | User | Admin |
|----------|--------|------|-------|
| POST /auth/login | ✅ | ✅ | ✅ |
| GET /sensors | ✅ | ✅ | ✅ |
| GET /sensors/:id/readings | ✅ | ✅ | ✅ |
| POST /sensors | ❌ | ❌ | ✅ |
| PUT /sensors/:id | ❌ | ❌ | ✅ |
| DELETE /sensors/:id | ❌ | ❌ | ✅ |
| GET /users | ❌ | ❌ | ✅ |
| POST /users | ❌ | ❌ | ✅ |
| GET /config/* | ❌ | ✅ | ✅ |
| PUT /config/* | ❌ | ❌ | ✅ |
| GET /export/csv | ❌ | ✅ | ✅ |

---

## 📅 Date & Time Format

All dates and times use **ISO 8601** format:
- Full datetime: `2025-01-14T10:15:25Z` (UTC)
- Date only: `2025-01-14`
- Time only: `10:15:25`

---

## 🚀 Implementation Priority

### Phase 1 (Critical - for basic functionality)
1. ✅ Authentication APIs (login, logout, get current user)
2. ✅ Get sensors list
3. ✅ Get sensor readings (with date range)
4. ✅ Get latest sensor reading

### Phase 2 (Important - for full features)
1. Mobile sensor routes
2. Analytics/trends API
3. Dashboard summary statistics
4. CSV export

### Phase 3 (Admin features)
1. User management APIs
2. Sensor configuration APIs
3. Threshold configuration APIs

### Phase 4 (Nice to have)
1. Real-time WebSocket updates
2. Bulk operations
3. Advanced analytics

---

## 📞 Support & Questions

For API implementation questions, contact:
- **Frontend Team:** [Your team contact]
- **Backend Team:** [API team contact]

---

**End of API Specification**
