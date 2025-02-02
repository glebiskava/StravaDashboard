# Strava Dashboard

## **1. Prerequisites**
Make sure you have the following installed on your system:

- **Python 3** (>=3.8)
- **pip** (Python package manager)
- **Virtual Environment (venv)**
- **Git** (optional but recommended)

To check if Python is installed, run:
```bash
python3 --version
```
If not installed, run:
```bash
sudo apt update && sudo apt install python3 python3-pip python3-venv
```

---

## **2. Clone the Repository (If Applicable)**
If you are using Git, clone the project:
```bash
git clone https://github.com/your-repository-url.git
cd strava_dashboard
```
If you are not using Git, create a new folder and manually move the project files into it:
```bash
mkdir strava_dashboard
cd strava_dashboard
```

---

## **3. Set Up the Python Virtual Environment**

Create a virtual environment:
```bash
python3 -m venv venv
```
Activate the virtual environment:
```bash
source venv/bin/activate
```
If you see `(venv)` before your terminal prompt, the environment is active.

---

## **4. Install Dependencies**
Inside the virtual environment, install the required packages:
```bash
pip install -r requirements.txt
```
If you don’t have a `requirements.txt`, install the necessary packages manually:
```bash
pip install flask flask-cors requests sqlite3 python-dotenv
```

---

## **5. Set Up Environment Variables**
To **secure your API keys**, avoid hardcoding them. Instead, use environment variables.

### **Option 1: Using `.env` File (Recommended)**
1. **Create a `.env` file** in the `backend/` folder:
    ```bash
    nano backend/.env
    ```
2. Add your **Strava API credentials**:
    ```ini
    STRAVA_CLIENT_ID=your_client_id
    STRAVA_CLIENT_SECRET=your_client_secret
    STRAVA_REFRESH_TOKEN=your_refresh_token
    ```
3. Save and exit (`CTRL + X`, then `Y`, then `Enter`).

### **Option 2: Using System Environment Variables**
Alternatively, you can export environment variables manually:
```bash
export STRAVA_CLIENT_ID="your_client_id"
export STRAVA_CLIENT_SECRET="your_client_secret"
export STRAVA_REFRESH_TOKEN="your_refresh_token"
```
To persist after a reboot, add them to `~/.bashrc`:
```bash
echo 'export STRAVA_CLIENT_ID="your_client_id"' >> ~/.bashrc
source ~/.bashrc
```

---

## **6. Start the Flask Backend**
Navigate to the backend folder and start the Flask server:
```bash
cd backend
python app.py
```
By default, Flask runs on **http://127.0.0.1:5000/**.

---

## **7. Start the Frontend**
The frontend is served by Flask, so once the backend is running, open your browser and go to:
```
http://127.0.0.1:5000/
```
If you are using a **separate frontend framework** (e.g., React or Vue):
```bash
cd frontend
npm install  # Install dependencies
npm start    # Start the frontend server
```

---

## **8. Fetch All Strava Activities**
To pull all Strava activities and store them in SQLite:
```bash
curl http://127.0.0.1:5000/activities
```
Once fetched, activities will be stored in `strava.db`.

---

## **9. Stopping the Application**
To stop the Flask server, use:
```bash
CTRL + C
```
To deactivate the virtual environment:
```bash
deactivate
```

---