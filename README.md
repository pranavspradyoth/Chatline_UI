# Frontend
cd your-angular-project
npm install
ng serve

# Backend (new terminal)
cd your-flask-project
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # then fill in keys
python run.py