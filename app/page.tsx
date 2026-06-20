import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}


/*
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
james@company.com
secret123
cd frontend 
npm run dev
*/