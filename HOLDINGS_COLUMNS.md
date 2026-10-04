# Holdings Table Columns Explained

## Portfolio % (NEW COLUMN)
Shows what percentage of your total portfolio value this asset represents.
- **Formula**: `(Current Value / Total Portfolio Value) × 100`
- **Example**: If AAPL is worth $5,000 and your total portfolio is $50,000, it shows `10.0%`
- Helps you see asset allocation at a glance

---

## Avg Cost (Average Cost Basis)
Shows the average price you paid per share for this holding.

**What it does:**
- Tracks how much you originally invested in each share
- Used to calculate your profit/loss against your actual purchase price
- **Not affected by current market price** - stays the same unless you manually edit it

**Example:**
- You bought 10 shares of AAPL at $150/share = $1,500 total
- Avg Cost = `$150.00` (your original purchase price per share)

---

## Price (Current Market Price)
Shows the current market price per share for this asset.

**What it does:**
- Updates automatically when you refresh prices
- For stocks/ETFs: fetched from Yahoo Finance
- For crypto: fetched from CoinGecko or other APIs
- Can be manually overridden if needed

**Example:**
- AAPL is currently trading at `$185.50` per share

---

## Value (Market Value)
Shows the total current value of your entire position in this asset.

**What it does:**
- Calculated as: `Current Price × Quantity Owned`
- Updates automatically when prices refresh
- Shows what your holding is worth right now

**Example:**
- 10 shares × $185.50 = `$1,855.00` total value

---

## Gain / Loss (Profit or Loss)
Shows your unrealized profit or loss on this position.

**What it does:**
- **Gain**: How much you've made above what you paid
- **Loss**: How much you've lost below what you paid
- Shows both absolute amount AND percentage change

**Formula:**
```
Gain/Loss = Current Value - (Avg Cost × Quantity)
Gain %    = ((Current Price / Avg Cost) - 1) × 100
```

**Example:**
- You bought 10 shares at $150/share ($1,500 total cost)
- Current price is $185.50 per share
- Current value: 10 × $185.50 = $1,855
- **Gain**: `$355.00` (you're up $355)
- **Gain %**: `23.7%` (your investment grew by 23.7%)

**Color coding:**
- 🟢 Green: Positive gain (profit)
- 🔴 Red: Negative gain (loss)
- ⚪ Gray: No data or zero change

---

## Updated
Shows when the price data was last refreshed for this asset.

**What it does:**
- Displays relative time (e.g., "2 minutes ago", "1 hour ago")
- Helps you know if prices are fresh or stale
- Click "Refresh Prices" to update all assets

---

## Quick Reference Summary

| Column | Shows | Updates Automatically? |
|--------|-------|----------------------|
| **Portfolio %** | Your asset's share of total portfolio | ✅ Yes (when prices refresh) |
| **Avg Cost** | What you paid per share | ❌ No (manual edit only) |
| **Price** | Current market price | ✅ Yes (on refresh) |
| **Value** | Total position worth now | ✅ Yes (on refresh) |
| **Gain/Loss** | Profit or loss on position | ✅ Yes (on refresh) |
| **Updated** | Last price update time | N/A (timestamp only) |

---

## Tips for Understanding Your Holdings

1. **Portfolio % helps with diversification**: If one asset is >30%, consider rebalancing
2. **Avg Cost never changes automatically**: Only edit if you made a mistake or added shares manually
3. **Gain/Loss is unrealized**: This is paper profit/loss until you sell
4. **Refresh prices regularly**: Market data updates periodically, check the "Updated" column
