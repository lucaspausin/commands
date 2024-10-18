import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET(request, { params }) {
	try {
		const result = await conn.query(
			`
			SELECT 
				ca.id AS comanda_id, 
				ca.boleto_reserva_id, 
				ca.tecnico_id, 
				ca.creado_en AS comanda_creado_en, 
				ca.actualizado_en AS comanda_actualizado_en,
				br.id AS boleto_reserva_id, 
				br.usuario_id, 
				br.modelo_patente, 
				br.equipo, 
				br.precio, 
				br.reforma_escape, 
				br.carga_externa, 
				br.sena, 
				br.monto_final_abonar, 
				br.fecha_instalacion, 
				cli.nombre_completo, 
				cli.dni, 
				cli.domicilio, 
				cli.localidad, 
				cli.telefono, 
				te.dia, 
				te.mes, 
				te.propietario, 
				te.dni AS dni_propietario, 
				te.marca_vehiculo, 
				te.anio_fabricacion, 
				te.patente, 
				te.observaciones_personales, 
				te.dominio, 
				te.modelo, 
				te.color, 
				te.anio, 
				te.detalle1, 
				te.detalle2, 
				te.detalle3, 
				te.detalle4, 
				te.observaciones_tecnicas
			FROM 
				comandas ca
			LEFT JOIN 
				boletos_reservas br ON ca.boleto_reserva_id = br.id
			LEFT JOIN 
				clientes cli ON br.cliente_id = cli.id
			LEFT JOIN 
				tecnica te ON br.id = te.boleto_reserva_id
			WHERE 
				ca.id = ?
		`,
			[params.id]
		);

		if (result.length === 0) {
			return NextResponse.json(
				{
					message: "Comanda no encontrada",
				},
				{
					status: 404,
				}
			);
		}

		return NextResponse.json(result[0]);
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

export async function DELETE(request, { params }) {
	try {
		const result = await conn.query("DELETE FROM comandas WHERE id = ?", [
			params.id,
		]);

		console.log(result);

		if (result.affectedRows === 0) {
			return NextResponse.json(
				{
					message: "Comanda no encontrada",
				},
				{
					status: 404,
				}
			);
		}
		return new Response(null, { status: 204 });
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

export async function PUT(request, { params }) {
	try {
		const data = await request.json();

		const result = await conn.query("UPDATE comandas SET ? WHERE id = ?", [
			data,
			params.id,
		]);

		if (result.affectedRows === 0) {
			return NextResponse.json(
				{
					message: "Comanda no encontrada",
				},
				{
					status: 404,
				}
			);
		}
		const updatedClient = await conn.query(
			"SELECT *FROM comandas WHERE id = ?",
			[params.id]
		);

		return NextResponse.json(updatedClient[0]);
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
