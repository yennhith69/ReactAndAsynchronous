# Buoi2 - React + PostgreSQL Practice

## Cau truc nop bai
- Frontend: `Frontend/index.html`, `Frontend/App.jsx`
- Backend + setup DB: `BackendAndSetupPostgreSQL/postgres_api.py`, `BackendAndSetupPostgreSQL/postgres_setup.sql`, `BackendAndSetupPostgreSQL/run_postgres_setup.ps1`, `BackendAndSetupPostgreSQL/requirements.txt`, `BackendAndSetupPostgreSQL/.env.example`
- Du lieu import: `Data/*_Cleaned.csv`

## Chay nhanh (Windows + PowerShell)
### 1) Tao venv va cai package
```powershell
cd D:\React\Buoi2
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r .\BackendAndSetupPostgreSQL\requirements.txt
```

### 2) Tao file env va sua password
```powershell
copy .\BackendAndSetupPostgreSQL\.env.example .\BackendAndSetupPostgreSQL\.env
```
Mo file `.\BackendAndSetupPostgreSQL\.env` va sua `POSTGRES_PASSWORD` dung voi may cua ban.

### 3) Import du lieu vao PostgreSQL
```powershell
.\BackendAndSetupPostgreSQL\run_postgres_setup.ps1 -DbUser postgres -PgHost localhost -Port 5432 -AdminDb postgres -SqlFile "D:\React\Buoi2\BackendAndSetupPostgreSQL\postgres_setup.sql"
```

### 4) Chay API
```powershell
.\.venv\Scripts\python.exe .\BackendAndSetupPostgreSQL\postgres_api.py
```

### 5) Mo frontend
Mo file `.\Frontend\index.html` bang Live Server hoac trinh duyet.

## Luu y
- Khong commit file `.env`.
- Khong commit thu muc `.venv`.
