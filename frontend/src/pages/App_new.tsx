import React, { useEffect, useState, useRef } from "react";
import { Plus, RefreshCw, BarChart3, AlertCircle, Package } from "lucide-react";
import { api } from "../api";
import ItemCard from "../components/ItemCard";
import type { LatestItem } from "../types";

export default function App() {
  const [items, setItems] = useState<LatestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // 単位の選択肢
  const displayUnits = ["本", "セット", "枚", "袋", "m", "kg", "㎡", "L", "トン", "箱"];
  const baseUnits = ["kg", "m", "枚", "㎡", "L", "トン", "本"];

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await api.listItems();
      setItems(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(undefined);

    try {
      const form = new FormData(e.currentTarget);
      const payload = {
        name: String(form.get("name") || ""),
        unit: String(form.get("unit") || "本"),
        base_unit: String(form.get("base_unit") || "kg"),
        conversion_factor: Number(form.get("conversion_factor") || 1),
        category: String(form.get("category") || "") || undefined,
        source_key: String(form.get("source_key") || "") || undefined,
      };

      await api.createItem(payload);

      // フォームのリセットを安全に実行
      if (formRef.current) {
        formRef.current.reset();
      }
      setShowForm(false);
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refresh();
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Material Price App</h1>
                <p className="text-sm text-gray-600">建設資材の価格管理システム</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>資材追加</span>
              </button>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>更新</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-8 animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">新しい資材を追加</h2>
            <form ref={formRef} onSubmit={onAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品名</label>
                  <input
                    name="name"
                    placeholder="例: 異形棒鋼 D10"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表示単位</label>
                  <select name="unit" defaultValue="セット" className="input-field">
                    {displayUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">基準単位</label>
                  <select name="base_unit" defaultValue="kg" className="input-field">
                    {baseUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">換算係数</label>
                  <input
                    name="conversion_factor"
                    type="number"
                    step="0.0001"
                    placeholder="1本=3.4kg → 3.4"
                    defaultValue="1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                  <input name="category" placeholder="任意" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ソースキー</label>
                  <input name="source_key" placeholder="任意" className="input-field" />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "追加中..." : "追加"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6 animate-slide-up">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-danger-500" />
              <span className="text-danger-700 font-medium">エラーが発生しました</span>
            </div>
            <p className="text-danger-600 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        )}

        {/* Items Grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">資材がありません</h3>
            <p className="text-gray-600 mb-6">最初の資材を追加して価格管理を始めましょう</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              資材を追加
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
