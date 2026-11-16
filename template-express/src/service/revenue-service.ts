import {sequelize} from "../config/db";
import {Validation} from "../validation/validation";
import {RevenueValidation} from "../validation/revenue-validation";

export interface DailyRevenue {
    date: string;
    revenue: number;
    order_count: number;
}

export interface DailyRevenueResponse {
    month: number;
    year: number;
    data: DailyRevenue[];
}

export interface RevenueAnomaly {
    date: string;
    revenue: number;
    order_count: number;
    z_score: number | null;
    is_anomaly: boolean;
    direction: "above" | "below" | null;
}

export interface RevenueAnomalyResponse {
    month: number;
    year: number;
    threshold: number;
    mean: number;
    std_dev: number;
    anomaly_count: number;
    data: RevenueAnomaly[];
}

interface RevenueRow {
    date: string;
    revenue: number;
    order_count: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

export class RevenueService {

    private static async fetchDailyRevenue(month: number, year: number): Promise<DailyRevenue[]> {
        const [rows] = await sequelize.query(`
            SELECT
                to_char(o.order_purchase_timestamp, 'YYYY-MM-DD') AS date,
                SUM(i.price + i.freight_value)::float8 AS revenue,
                COUNT(DISTINCT o.order_id)::int        AS order_count
            FROM orders o
            JOIN order_items i ON i.order_id = o.order_id
            WHERE o.order_status <> 'canceled'
              AND o.order_purchase_timestamp >= make_date($year, $month, 1)
              AND o.order_purchase_timestamp <  make_date($year, $month, 1) + interval '1 month'
            GROUP BY 1
            ORDER BY 1
        `, {
            bind: {year, month},
        });

        const revenueByDate = new Map(
            (rows as RevenueRow[]).map((row) => [row.date, row]),
        );

        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const data: DailyRevenue[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const row = revenueByDate.get(date);
            data.push({
                date,
                revenue: row ? Number(row.revenue) : 0,
                order_count: row ? Number(row.order_count) : 0,
            });
        }
        return data;
    }

    static async dailyRevenue(query: {month?: unknown; year?: unknown}): Promise<DailyRevenueResponse> {
        const params = Validation.validate(RevenueValidation.DAILY, {
            month: query.month,
            year: query.year,
        }) as {month: number; year: number};

        return {
            month: params.month,
            year: params.year,
            data: await this.fetchDailyRevenue(params.month, params.year),
        };
    }

    static async dailyRevenueAnomalies(query: {
        month?: unknown;
        year?: unknown;
        threshold?: unknown;
    }): Promise<RevenueAnomalyResponse> {
        const params = Validation.validate(RevenueValidation.ANOMALY, {
            month: query.month,
            year: query.year,
            threshold: query.threshold,
        }) as {month: number; year: number; threshold: number};

        const data = await this.fetchDailyRevenue(params.month, params.year);

        const total = data.reduce((sum, row) => sum + row.revenue, 0);
        const mean = total / data.length;
        const variance = data.reduce((sum, row) => sum + (row.revenue - mean) ** 2, 0) / data.length;
        const stdDev = Math.sqrt(variance);

        const anomalies: RevenueAnomaly[] = data.map((row) => {
            if (stdDev === 0) {
                return {...row, z_score: null, is_anomaly: false, direction: null};
            }
            const zScore = round2((row.revenue - mean) / stdDev);
            const isAnomaly = Math.abs(zScore) > params.threshold;
            let direction: RevenueAnomaly["direction"] = null;
            if (isAnomaly && zScore > 0) {
                direction = "above";
            } else if (isAnomaly) {
                direction = "below";
            }
            return {
                ...row,
                z_score: zScore,
                is_anomaly: isAnomaly,
                direction,
            };
        });

        return {
            month: params.month,
            year: params.year,
            threshold: params.threshold,
            mean: round2(mean),
            std_dev: round2(stdDev),
            anomaly_count: anomalies.filter((row) => row.is_anomaly).length,
            data: anomalies,
        };
    }
}
