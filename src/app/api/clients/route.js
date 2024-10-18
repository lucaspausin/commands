import { NextResponse } from "next/server";
import { conn } from "@/libs/mysql";

export async function GET() {
	try {
		const results = await conn.query("SELECT * FROM clientes");
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
	const { nombre_completo, dni, domicilio, localidad, telefono } =
		await request.json();

	try {
		const result = await conn.query("INSERT INTO clientes SET ?", {
			nombre_completo,
			dni,
			domicilio,
			localidad,
			telefono,
		});
		return NextResponse.json({
			nombre_completo,
			dni,
			domicilio,
			localidad,
			telefono,
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
