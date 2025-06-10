# ShelterFlow Supply-Chain Optimizer

A comprehensive supply-chain optimization system for homeless shelters, built with modern web technologies and AWS services.

## Project Structure

```
shelterflow-consolidated/
├── backend/                 # FastAPI backend service
│   ├── app/
│   │   └── main.py         # Main FastAPI application
│   ├── tests/
│   │   └── test_forecasting.py
│   ├── lambda/
│   │   └── index.py        # AWS Lambda function for inventory management
│   └── requirements.txt
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ForecastOverview.tsx
│   │   │   └── OrderManagement.tsx
│   │   ├── App.tsx
│   │   └── env.d.ts
│   ├── package.json
│   └── tsconfig.json
└── .github/
    └── workflows/
        └── ci.yml          # GitHub Actions workflow
```

## Features

- **Forecasting Service**: Predicts future inventory needs using Amazon Bedrock TimeLLM
- **Procurement Agent**: Automatically generates purchase orders based on forecasts
- **Frontend Dashboard**: Real-time visualization of forecasts and order management
- **Infrastructure as Code**: AWS CDK for infrastructure deployment
- **CI/CD Pipeline**: Automated testing and deployment

## Prerequisites

- Python 3.9+
- Node.js 18+
- AWS Account with appropriate permissions
- Docker (for local development)

## Setup

### Backend

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and configuration
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

The project uses AWS CDK for infrastructure deployment. To deploy:

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Deploy the infrastructure:
   ```bash
   cd infrastructure
   cdk deploy
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 