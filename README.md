# Material Price App (MVP)

React (Vite, TypeScript) + FastAPI (Python) スターター

## 概要
- 毎日 0:00 JST に資材単価を更新（ローカルは APScheduler でデモ。実運用は EventBridge + Lambda を推奨）
- ユーザー登録アイテムのみ、最新単価と前日比（↑↓）を表示
- 価格取得ソースはアダプタ方式（ダミー実装済）

## セットアップ

### 1) Backend (FastAPI)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# .env を作成（.env.example をコピー）
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend (Vite + React + TS)
```bash
cd frontend
npm install
npm run dev
```

- フロントは `http://localhost:5173`
- バックエンドは `http://localhost:8000`

## 環境変数
- backend/.env
```
DATABASE_URL=sqlite+aiosqlite:///./app.db
JWT_SECRET=dev-secret
SCHEDULE_TZ=Asia/Tokyo
```

## API (ざっくり)
- `GET /items` : ユーザーのアイテム + 最新価格（ダミー認証: user_id=00000000-0000-0000-0000-000000000001）
- `POST /items` : アイテム登録
- `GET /items/{id}/prices?limit=30` : 履歴
- `POST /refresh` : 価格更新（デモ: ダミーアダプタでランダム変動）

## 今後の拡張
- DB を Postgres に変更（DATABASE_URL を差し替え）
- 認証を Cognito に
- 価格取得アダプタを実データソースに差し替え
- EventBridge + Lambda で 0:00 JST 実行
```

