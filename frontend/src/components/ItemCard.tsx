import React from "react";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import type { LatestItem } from "../types";
import { clsx } from "clsx";

export default function ItemCard({ item }: { item: LatestItem }) {
  const rate = item.deltaRate ?? 0;
  const isPositive = rate > 0;
  const isNegative = rate < 0;
  const isNeutral = rate === 0;

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    if (isNegative) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getBadgeClasses = () => {
    if (isPositive) return "badge-up";
    if (isNegative) return "badge-down";
    return "badge-neutral";
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "価格未設定";
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "未更新";
    return new Date(dateString).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
          {item.category && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
              {item.category}
            </span>
          )}
        </div>
        <div className={clsx("flex items-center gap-1", getBadgeClasses())}>
          {getTrendIcon()}
          <span className="font-medium">
            {rate ? `${rate > 0 ? "+" : ""}${rate.toFixed(1)}%` : "0.0%"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">現在価格</span>
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(item.latestPrice)}
            <span className="text-sm font-normal text-gray-500 ml-1">/ {item.unit}</span>
          </span>
        </div>

        {item.updatedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>最終更新: {formatDate(item.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
