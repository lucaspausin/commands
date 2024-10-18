import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET() {
	try {
		// Reservas del mes actual
		const currentMonthResult = await conn.query(`
            SELECT 
                COUNT(*) AS currentMonthReservations
            FROM 
                boletos_reservas
            WHERE 
                fecha_instalacion >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
                AND fecha_instalacion < DATE_FORMAT(CURRENT_DATE() + INTERVAL 1 MONTH, '%Y-%m-01')
        `);

		// Reservas del mes anterior
		const previousMonthResult = await conn.query(`
            SELECT 
                COUNT(*) AS previousMonthReservations
            FROM 
                boletos_reservas
            WHERE 
                fecha_instalacion >= DATE_FORMAT(CURRENT_DATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                AND fecha_instalacion < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        `);

		const currentMonthReservations =
			currentMonthResult[0].currentMonthReservations;
		const previousMonthReservations =
			previousMonthResult[0].previousMonthReservations;

		// Calcular el cambio de porcentaje
		let percentageChange = "0.0%";
		if (previousMonthReservations === 0) {
			if (currentMonthReservations > 0) {
				percentageChange = "+100.0%"; // Cambia a +100.0% si el mes anterior es 0 y el actual > 0
			}
		} else {
			const change =
				((currentMonthReservations - previousMonthReservations) /
					previousMonthReservations) *
				100;
			percentageChange = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`; // Formato +/-
		}

		return NextResponse.json({
			totalReservations: currentMonthReservations + previousMonthReservations, // Total de reservas
			currentMonthReservations,
			previousMonthReservations,
			percentageChange,
		});
	} catch (error) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
