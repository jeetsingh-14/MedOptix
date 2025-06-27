# MedOptix Dashboard

A responsive React dashboard for healthcare analytics, built with React, Vite, Recharts, and Tailwind CSS.

## Developer

This project was developed by Jeet Singh Saini.

## Features

- **Overview Dashboard**: KPI cards and appointment trends
- **A/B Testing Analysis**: Compare treatment approaches with statistical significance
- **Department Statistics**: No-show rates, patient load vs staffing, equipment downtime
- **Operational Insights**: Correlation analysis and key operational metrics
- **Recommendations**: Data-driven recommendations with implementation priorities

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Data**: Connects to FastAPI backend or uses mock data

## Project Structure

```
/client/medoptix-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── apiService.js
│   ├── assets/
│   ├── components/
│   │   ├── AreaChart.jsx
│   │   ├── BarChart.jsx
│   │   ├── CorrelationMatrix.jsx
│   │   ├── HeatmapCard.jsx
│   │   ├── KPICard.jsx
│   │   ├── LineChart.jsx
│   │   ├── MarkdownRenderer.jsx
│   │   ├── ScatterPlot.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── ABTesting.jsx
│   │   ├── DepartmentStats.jsx
│   │   ├── OperationalInsights.jsx
│   │   ├── Overview.jsx
│   │   └── Recommendations.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd client/medoptix-dashboard
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development

Run the development server:
```
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application:
```
npm run build
```

The built files will be in the `dist` directory.

### Backend Connection

By default, the dashboard uses mock data. To connect to a real backend:

1. Set up the FastAPI backend (not included in this repository)
2. Start the backend server at `http://localhost:8000`
3. Open `src/api/apiService.js` and set `USE_MOCK_DATA = false`

## Design Guidelines

- **Colors**: Primary blue (#0ea5e9) and secondary purple (#8b5cf6)
- **Typography**: Inter font family
- **Components**: Rounded corners, soft shadows, grid layout
- **Responsiveness**: Mobile-first design with responsive breakpoints

## License

MIT
