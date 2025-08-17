# 📊 Material Price App

建設業向けの **資材単価管理アプリ**
React (Vite + TypeScript) + FastAPI (Python) をベースにした MVP プロジェクトです。

---

## 🚀 機能 (MVP)

- ユーザーが登録した資材だけを管理
- **毎日 0:00 (JST)** に単価を更新（デモでは手動更新/ランダム変動）
- 単価の **前日比 (↑↓, %)** を表示
- アイテムごとに履歴（過去30日）を保持
- 単位換算対応（例: 1本=3.4kg）

---

## 🛠 技術スタック

- **フロントエンド**: React + Vite + TypeScript
- **バックエンド**: FastAPI + SQLAlchemy + SQLite (デフォルト)
- **DB**: SQLite → PostgreSQL へ移行可能
- **ジョブ管理**: APScheduler (ローカル) / AWS EventBridge + Lambda (本番想定)


---

## ⚙️ セットアップ

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env           # 環境変数を設定
uvicorn app.main:app --reload --port 8000
