import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET() {
	try {
		const results = await conn.query(`
      SELECT 
        br.*, 
        c.nombre_completo, 
        c.dni, 
        c.domicilio, 
        c.localidad, 
        c.telefono,
        u.nombre_usuario
      FROM 
        boletos_reservas br
      LEFT JOIN 
        clientes c ON br.cliente_id = c.id
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

export async function POST(request) {
	const {
		nombre_completo,
		dni,
		domicilio,
		localidad,
		telefono,
		usuario_id, // Asegúrate de incluir este campo
		modelo_patente,
		equipo,
		precio,
		reforma_escape,
		carga_externa,
		sena,
		monto_final_abonar,
		fecha_instalacion,
	} = await request.json();

	// Verifica que todos los campos estén presentes
	const missingFields = [];
	if (!nombre_completo) missingFields.push("nombre_completo");
	if (!dni) missingFields.push("dni");
	if (!domicilio) missingFields.push("domicilio");
	if (!localidad) missingFields.push("localidad");
	if (!telefono) missingFields.push("telefono");
	if (!usuario_id) missingFields.push("usuario_id");
	if (!modelo_patente) missingFields.push("modelo_patente");
	if (!equipo) missingFields.push("equipo");
	if (!precio) missingFields.push("precio");
	if (!monto_final_abonar) missingFields.push("monto_final_abonar");
	if (!fecha_instalacion) missingFields.push("fecha_instalacion");

	if (missingFields.length > 0) {
		return NextResponse.json(
			{ message: `Faltan campos obligatorios: ${missingFields.join(", ")}` },
			{ status: 400 }
		);
	}

	// Iniciar una transacción para asegurar que ambas operaciones sucedan juntas
	await conn.query("BEGIN"); // Inicia la transacción

	try {
		// Insertar datos del cliente
		const clientResult = await conn.query("INSERT INTO clientes SET ?", {
			nombre_completo,
			dni,
			domicilio,
			localidad,
			telefono,
		});

		const clienteId = clientResult.insertId;

		const reservationResult = await conn.query(
			"INSERT INTO boletos_reservas SET ?",
			{
				usuario_id,
				cliente_id: clienteId,
				modelo_patente,
				equipo,
				precio,
				reforma_escape,
				carga_externa,
				sena,
				monto_final_abonar,
				fecha_instalacion,
			}
		);

		const reservaId = reservationResult.insertId;

		await conn.query("INSERT INTO comandas SET ?", {
			boleto_reserva_id: reservaId,
			estado: "pendiente",
		});

		await conn.query("COMMIT");

		return NextResponse.json({
			cliente: {
				nombre_completo,
				dni,
				domicilio,
				localidad,
				telefono,
				id: clienteId,
			},
			reserva: {
				modelo_patente,
				equipo,
				precio,
				reforma_escape,
				carga_externa,
				sena,
				monto_final_abonar,
				fecha_instalacion,
				id: reservationResult.insertId,
			},
		});
	} catch (error) {
		// En caso de error, revertimos la transacción
		await conn.query("ROLLBACK"); // Revierte la transacción

		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
