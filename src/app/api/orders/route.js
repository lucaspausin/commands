import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET() {
	try {
		const results = await conn.query(`
			SELECT 
				ca.id AS comanda_id, 
				ca.boleto_reserva_id, 
				ca.tecnico_id, 
				ca.estado,
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
				te.observaciones_tecnicas,
				u.nombre_usuario
			FROM 
				comandas ca
			LEFT JOIN 
				boletos_reservas br ON ca.boleto_reserva_id = br.id
			LEFT JOIN 
				clientes cli ON br.cliente_id = cli.id
			LEFT JOIN 
				tecnica te ON br.id = te.boleto_reserva_id
			LEFT JOIN 
				usuarios u ON br.usuario_id = u.id
		`);
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
