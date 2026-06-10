# Project summary
An intelligent tool that transforms your static PDF study notes into interactive quizzes. Powered by Bielik, the premier Polish large language model, this project helps you test your knowledge and study more effectively.

# To run the project
1. Navigate to backend:
```bash
cd backend
```

2. Run 
```bash
 cp .env.example .env 
```
3. Edit .env - paste your PCSS API key
```
PCSS_API_KEY=<twój_klucz_tutaj>
```
4. Run 
```bash 
uvicorn main:app --reload
```
5. In another terminal:
```bash
cd frontend
npm i
npm run dev
```
and go to http://localhost:5173
