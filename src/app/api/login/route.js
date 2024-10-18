import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { conn } from "@/libs/mysql";

export async function POST(req) {
	try {
		const { email, contraseña } = await req.json();

		const existingUser = await conn.query(
			"SELECT * FROM usuarios WHERE email = ?",
			[email]
		);

		if (existingUser.length === 0) {
			return NextResponse.json(
				{ error: "Credenciales inválidas." },
				{ status: 401 }
			);
		}

		const user = existingUser[0];

		// Verificar la contraseña
		const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Credenciales inválidas." },
				{ status: 401 }
			);
		}

		// Aquí podrías incluir la creación de un token de sesión o cualquier otra lógica de autenticación
		return NextResponse.json({
			message: "Inicio de sesión exitoso",
			userId: user.id,
			role: user.role_id, // Asegúrate de incluir el rol aquí
		});
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
