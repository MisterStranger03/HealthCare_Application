# HealthCare Application

## Description
This HealthCare Application is a platform for managing healthcare tasks, including patient management, report uploads, analytics, and subscriptions. It features a Python-based backend for APIs and logic, and a React-Typescript frontend for an intuitive user experience.

## Features
- User authentication and authorization
- Patient management and profile completion
- Report uploads and analytics visualization
- Subscription management for premium features
- Dashboard for healthcare insights

## Project Structure
```
HealthCare_Application/
├── backend/
│   ├── app/
│   ├── api/
│   ├── graph/
│   ├── logs/
│   ├── services/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── package.json
```

## Technologies Used
### Backend:
- Python
- FastAPI
- SQLAlchemy

### Frontend:
- React
- TypeScript
- Vite

## Setup Instructions
### Backend:
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend:
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request.

## License
This project is licensed under the MIT License.