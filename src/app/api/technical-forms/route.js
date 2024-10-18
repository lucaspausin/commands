import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

// Obtener todos los registros técnicos
export async function GET() {
	try {
		const results = await conn.query("SELECT * FROM tecnica");
		return NextResponse.json({ results });
	} catch (error) {
		return NextResponse.json(
			{ message: error.message },
			{
				status: 500,
			}
		);
	}
}

// Crear un nuevo registro técnico
export async function POST(request) {
	const {
		boleto_reserva_id,
		dia,
		mes,
		propietario,
		dni,
		marca_vehiculo,
		modelo,
		anio_fabricacion,
		patente,
		dominio,
		color,
		anio,
		detalle1,
		detalle2,
		detalle3,
		detalle4,
		observaciones_personales,
		observaciones_tecnicas,
	} = await request.json();

	try {
		const result = await conn.query("INSERT INTO tecnica SET ?", {
			boleto_reserva_id,
			dia,
			mes,
			propietario,
			dni,
			marca_vehiculo,
			modelo,
			anio_fabricacion,
			patente,
			dominio,
			color,
			anio,
			detalle1,
			detalle2,
			detalle3,
			detalle4,
			observaciones_personales,
			observaciones_tecnicas,
		});

		return NextResponse.json({
			boleto_reserva_id,
			dia,
			mes,
			propietario,
			dni,
			marca_vehiculo,
			modelo,
			anio_fabricacion,
			patente,
			dominio,
			color,
			anio,
			detalle1,
			detalle2,
			detalle3,
			detalle4,
			observaciones_personales,
			observaciones_tecnicas,
			id: result.insertId,
		});
	} catch (error) {
		return NextResponse.json(
			{
				message: error.message,
			},
			{
				status: 500,
			}
		);
	}
}
