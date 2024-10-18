import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET() {
	try {
		// Total de comandas y estados
		const ordersCountResult = await conn.query(`
            SELECT 
                COUNT(*) AS total_orders,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS total_pending,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) AS total_completed
            FROM comandas
        `);

		const { total_orders, total_pending, total_completed } =
			ordersCountResult[0];

		// Comandas del mes actual que están completadas
		const currentMonthResult = await conn.query(`
            SELECT COUNT(*) AS current_month_orders
            FROM comandas
            WHERE 
                estado = 'completado' AND
                MONTH(creado_en) = MONTH(CURRENT_DATE()) AND 
                YEAR(creado_en) = YEAR(CURRENT_DATE())
        `);

		const current_month_orders = currentMonthResult[0].current_month_orders;

		// Comandas del mes anterior que están completadas
		const previousMonthResult = await conn.query(`
            SELECT COUNT(*) AS previous_month_orders
            FROM comandas
            WHERE 
                estado = 'completado' AND
                MONTH(creado_en) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND 
                YEAR(creado_en) = YEAR(CURRENT_DATE())
        `);

		const previous_month_orders = previousMonthResult[0].previous_month_orders;

		// Calcular porcentaje de cambio
		let percentageChange = "0.0%";
		if (previous_month_orders === 0) {
			if (current_month_orders > 0) {
				percentageChange = "+100.0%"; // Cambia a +100.0% si el mes anterior es 0 y el actual > 0
			}
		} else {
			const change =
				((current_month_orders - previous_month_orders) /
					previous_month_orders) *
				100;
			percentageChange = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`; // Formato +/-
		}

		return NextResponse.json({
			totalOrders: total_orders,
			totalPending: total_pending,
			totalCompleted: total_completed,
			currentMonthOrders: current_month_orders,
			previousMonthOrders: previous_month_orders,
			percentageChange,
		});
	} catch (error) {
		return NextResponse.json(
			{ message: error.message },
			{
				status: 500,
			}
		);
	}
}
