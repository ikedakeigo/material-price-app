class PriceAdapter:
    """価格取得アダプタのベースクラス"""
    def fetch_unit_price(self, key: str) -> float:
        raise NotImplementedError

class DummyAdapter(PriceAdapter):
    def fetch_unit_price(self, key: str) -> float:
        # 実装時は外部APIやCSV等から取得
        return 500.0
