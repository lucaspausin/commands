import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { conn } from "@/libs/mysql";

export async function POST(req) {
	try {
		const { nombre_usuario, email, contraseña } = await req.json();

		const existingUser = await conn.query(
			"SELECT * FROM usuarios WHERE email = ?",
			[email]
		);

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ error: "El email ya está en uso." },
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(contraseña, 10);

		// Asignar el role de 'vendedor' (role = 1)
		const role_id = 1;

		const result = await conn.query(
			"INSERT INTO usuarios (nombre_usuario, email, contraseña, role_id) VALUES (?, ?, ?, ?)",
			[nombre_usuario, email, hashedPassword, role_id]
		);

		if (result.affectedRows === 1) {
			return NextResponse.json(
				{ message: "Registro exitoso" },
				{ status: 201 }
			);
		} else {
			throw new Error("Error al registrar el usuario.");
		}
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
