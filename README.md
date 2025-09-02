# 📊 Material Price App

建設業向けの **資材単価管理アプリ**
React (Vite + TypeScript) + FastAPI (Python) をベースにした MVP プロジェクトです。

---

## 🚀 機能 (MVP)

- ユーザーが登録した資材だけを管理（**ユーザー × 名前で一意制約**）
- **毎日 0:00 (JST)** に単価を更新（デモでは手動更新/ランダム変動）
- 単価の **前日比 (↑↓, %)** を表示
- アイテムごとに履歴（過去 30 日）を保持
- 単位換算対応（例: 1 本=3.4kg）
- **表示単位・基準単位**をセレクタで選択可能

---

## 🛠 技術スタック

- **フロントエンド**: React + Vite + TypeScript + Tailwind CSS
- **バックエンド**: FastAPI + SQLAlchemy + PostgreSQL (asyncpg)
- **DB**: PostgreSQL (Docker Compose 対応)
- **ジョブ管理**: APScheduler (ローカル) / AWS EventBridge + Lambda (本番想定)

---

## ⚙️ セットアップ

### 1. PostgreSQL の起動

```bash
# Docker Composeを使用してPostgreSQLを起動
docker compose up -d db
```

### 2. Backend (FastAPI)

```bash
cd backend

# 仮想環境の作成・有効化
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定（.envファイル）
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/materials
# JWT_SECRET=dev-secret
# SCHEDULE_TZ=Asia/Tokyo

# サーバー起動
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend (React + Vite)

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:5173` (または表示されたポート) にアクセス

---

## 🧪 動作確認手順

1. **PostgreSQL 起動**: `docker compose up -d db`
2. **バックエンド起動**: 上記の Backend セットアップ手順
3. **フロントエンド起動**: 上記の Frontend セットアップ手順
4. **動作テスト**:
   - 画面から同じ名前の資材を 2 回追加 → カードは 1 枚のみ表示されること
   - 表示単位・基準単位をセレクタで選択して保存 → API レスポンスに正しく保存されていること
   - 「更新」ボタンクリック → 最新価格と前日比が更新されること

---

## 📝 環境変数例

**backend/.env**

```properties
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/materials
JWT_SECRET=dev-secret
SCHEDULE_TZ=Asia/Tokyo
```

**PostgreSQL 設定（docker-compose.yml）**

- ユーザー: postgres
- パスワード: postgres
- データベース: materials
- ポート: 5433 (ホスト側)

---

## 🗄️ データベース

- **PostgreSQL** をメイン DB として使用
- **UniqueConstraint**: ユーザー × 名前で重複禁止
- 初回起動時に自動でテーブル作成
- **永続化**: Docker ボリューム `pgdata` でデータ保持
