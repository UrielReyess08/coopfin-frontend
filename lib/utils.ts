// Utilidades compartidas

export function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidDni(value: string) {
	return /^\d{8}$/.test(value.trim());
}

export function isValidRuc(value: string) {
	return /^\d{11}$/.test(value.trim());
}

export function isValidPhone(value: string) {
	return /^\d{9}$/.test(value.trim());
}

export function isValidPassword(value: string) {
	return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function isPositiveNumber(value: string | number) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0;
}

export function isValidDayOfMonth(value: string | number) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 1 && parsed <= 31;
}

export function isValidHexColor(value: string) {
	return /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}
