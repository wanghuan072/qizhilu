import { StatusError } from "itty-router"

export abstract class BaseError extends StatusError {}

export class BadRequestError extends BaseError {
	constructor(message?: string)
	constructor(code: number, message?: string)
	constructor(...args: [string?] | [number, string?]) {
		if (args.length === 1) {
			super(400, (args[0] as string) ?? "BadRequestError")
		} else {
			super(
				(args[0] as number) ?? 400,
				(args[1] as string) ?? "BadRequestError",
			)
		}
	}
}

export class BusinessError extends BaseError {
	constructor(message?: string)
	constructor(code: number, message: string)
	constructor(...args: [string?] | [number, string?]) {
		if (args.length === 1) {
			super(500, (args[0] as string) ?? "BusinessError")
		} else {
			super((args[0] as number) ?? 500, (args[1] as string) ?? "BusinessError")
		}
	}
}

export class ArgumentsError extends BaseError {
	constructor(message?: string)
	constructor(code: number, message?: string)
	constructor(...args: [string?] | [number, string?]) {
		if (args.length === 1) {
			super(400, (args[0] as string) ?? "ArgumentsError")
		} else {
			super((args[0] as number) ?? 400, (args[1] as string) ?? "ArgumentsError")
		}
	}
}

export class NotFoundError extends BaseError {
	constructor(message?: string)
	constructor(code: number, message?: string)
	constructor(...args: [string?] | [number, string?]) {
		if (args.length === 1) {
			super(404, (args[0] as string) ?? "NotFoundError")
		} else {
			super((args[0] as number) ?? 404, (args[1] as string) ?? "NotFoundError")
		}
	}
}

export class UnauthorizedError extends BaseError {
	constructor(message?: string)
	constructor(code: number, message?: string)
	constructor(...args: [string?] | [number, string?]) {
		if (args.length === 1) {
			super(401, (args[0] as string) ?? "UnauthorizedError")
		} else {
			super(
				(args[0] as number) ?? 401,
				(args[1] as string) ?? "UnauthorizedError",
			)
		}
	}
}
