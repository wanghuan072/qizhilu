"use client"

import { cn } from "@/lib/utils/react/styles"
import { type VariantProps, cva } from "class-variance-authority"
import { AlertCircle, FileText, Upload, X } from "lucide-react"
import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "./button"

// Types
export type FileWithPreview = File & {
	preview: string
	id: string
}

// 新增类型定义，支持URL字符串
export type FileOrUrl = FileWithPreview | string

// Helper function to convert size string to bytes
export function parseFileSize(size: string | number): number {
	if (typeof size === "number") return size

	const units = {
		b: 1,
		kb: 1024,
		mb: 1024 * 1024,
		gb: 1024 * 1024 * 1024,
		tb: 1024 * 1024 * 1024 * 1024,
	}

	const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/)
	if (!match || !match[1] || !match[2]) return Number.parseInt(size, 10) || 0

	const numStr = match[1]
	const unit = match[2]
	const unitMultiplier = units[unit as keyof typeof units] || 1

	return Number.parseFloat(numStr) * unitMultiplier
}

// Helper function to format bytes to human-readable size
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B"

	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(1024))

	return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

// Variants for the uploader component
const uploaderVariants = cva(
	"relative flex flex-col items-center justify-center w-full rounded-md border border-dashed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
	{
		variants: {
			variant: {
				default: "border-border bg-background hover:bg-accent/50",
				image: "border-primary/30 bg-background hover:bg-primary/5",
				destructive:
					"border-destructive/50 bg-destructive/5 hover:bg-destructive/10",
				avatar: "border-border bg-background hover:bg-accent/50 rounded-lg",
			},
			size: {
				sm: "h-32 p-2",
				default: "h-64 p-4",
				md: "h-80 p-6",
				lg: "h-96 p-8",
			},
		},
		compoundVariants: [
			// Avatar variant special sizes
			{
				variant: "avatar",
				size: "sm",
				className: "h-16 w-16 p-1",
			},
			{
				variant: "avatar",
				size: "default",
				className: "h-24 w-24 p-2",
			},
			{
				variant: "avatar",
				size: "md",
				className: "h-32 w-32 p-3",
			},
			{
				variant: "avatar",
				size: "lg",
				className: "h-40 w-40 p-4",
			},
			// Image variant special heights
			{
				variant: "image",
				size: "sm",
				className: "h-36 p-2",
			},
			{
				variant: "image",
				size: "default",
				className: "h-72 p-4",
			},
			{
				variant: "image",
				size: "md",
				className: "h-96 p-6",
			},
			{
				variant: "image",
				size: "lg",
				className: "h-[30rem] p-8",
			},
		],
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
)

// Props for the uploader component
export interface UploaderProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof uploaderVariants> {
	accept?: string
	maxFiles?: number | string
	maxSize?: number | string
	disabled?: boolean
	value?: FileOrUrl[] | FileOrUrl | null
	onFileChange?: (files: FileOrUrl[]) => void
	onRemove?: (file: FileOrUrl) => void
	className?: string
	errorMessage?: string
	formatErrorMessage?: {
		tooManyFiles?: string
		fileSizeError?: string
		fileInvalidType?: string
	}
	children?: React.ReactNode
	placeholder?: React.ReactNode
	classNames?: {
		container?: string
		dropzone?: string
		preview?: string
		previewItem?: string
		error?: string
	}
}

// Main Uploader component
export function Uploader({
	accept = "image/*,application/pdf",
	maxFiles = 1,
	maxSize = "2MB", // Default 2MB
	disabled = false,
	value = [],
	onFileChange,
	onRemove,
	className,
	variant,
	size,
	errorMessage,
	formatErrorMessage,
	children,
	placeholder,
	classNames,
	...props
}: UploaderProps) {
	// 转换单个值为数组
	const initialValue = React.useMemo(() => {
		if (value === null || value === undefined) return []
		if (Array.isArray(value)) return value
		return [value]
	}, [value])

	const [files, setFiles] = React.useState<FileOrUrl[]>(initialValue)
	const [error, setError] = React.useState<string | null>(errorMessage || null)

	// Parse maxFiles and maxSize
	const parsedMaxFiles =
		typeof maxFiles === "string" ? Number.parseInt(maxFiles, 10) : maxFiles
	const parsedMaxSize = parseFileSize(maxSize)

	// Update internal files state when value prop changes
	React.useEffect(() => {
		const newValue =
			value === null || value === undefined
				? []
				: Array.isArray(value)
					? value
					: [value]

		// 使用JSON.stringify进行深度比较，避免不必要的状态更新
		if (JSON.stringify(newValue) !== JSON.stringify(files)) {
			setFiles(newValue)
		}
	}, [value, files])

	// Update error message when errorMessage prop changes
	React.useEffect(() => {
		if (errorMessage) {
			setError(errorMessage)
		}
	}, [errorMessage])

	// Clean up previews when component unmounts
	React.useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (typeof file !== "string" && file.preview) {
					URL.revokeObjectURL(file.preview)
				}
			})
		}
	}, [files])

	// Handle file drop
	const onDrop = React.useCallback(
		(acceptedFiles: File[], rejectedFiles: any[]) => {
			// Handle rejected files
			if (rejectedFiles.length > 0) {
				const rejectionErrors = rejectedFiles.map((rejection) => {
					const file = rejection.file.name
					const errors = rejection.errors.map((e: any) => {
						// 自定义错误信息
						if (
							e.code === "file-too-large" &&
							formatErrorMessage?.fileSizeError
						) {
							return formatErrorMessage.fileSizeError
								.replace("{file}", file)
								.replace("{size}", formatFileSize(parsedMaxSize))
						}
						if (
							e.code === "file-invalid-type" &&
							formatErrorMessage?.fileInvalidType
						) {
							return formatErrorMessage.fileInvalidType
								.replace("{file}", file)
								.replace("{accept}", accept)
						}
						return `${file}: ${e.message}`
					})
					return errors.join(", ")
				})

				setError(rejectionErrors.join("\n"))
				return
			}

			// Clear previous errors
			setError(null)

			// Check if adding new files would exceed maxFiles
			if (files.length + acceptedFiles.length > parsedMaxFiles) {
				const tooManyFilesMessage = formatErrorMessage?.tooManyFiles
					? formatErrorMessage.tooManyFiles.replace(
							"{maxFiles}",
							String(parsedMaxFiles),
						)
					: `Maximum of ${parsedMaxFiles} file${
							parsedMaxFiles === 1 ? "" : "s"
						} allowed`

				setError(tooManyFilesMessage)
				return
			}

			// Process accepted files
			const newFiles = acceptedFiles.map((file) =>
				Object.assign(file, {
					preview: URL.createObjectURL(file),
					id: `${file.name}-${Date.now()}`,
				}),
			) as FileWithPreview[]

			const updatedFiles = [...files, ...newFiles]
			setFiles(updatedFiles)
			onFileChange?.(updatedFiles)
		},
		[
			files,
			parsedMaxFiles,
			parsedMaxSize,
			onFileChange,
			formatErrorMessage,
			accept,
		],
	)

	// Handle file removal
	const handleRemove = (file: FileOrUrl) => {
		const updatedFiles = files.filter((f) => {
			if (typeof f === "string" && typeof file === "string") {
				return f !== file
			}
			if (typeof f !== "string" && typeof file !== "string") {
				return f.id !== file.id
			}
			return true
		})
		setFiles(updatedFiles)
		onFileChange?.(updatedFiles)
		onRemove?.(file)

		// Revoke object URL to avoid memory leaks
		if (typeof file !== "string" && file.preview) {
			URL.revokeObjectURL(file.preview)
		}
	}

	// Convert string accept to object format for dropzone
	const getAcceptFromString = (acceptString: string) => {
		const acceptObject: Record<string, string[]> = {}
		acceptString.split(",").forEach((type) => {
			acceptObject[type.trim()] = []
		})
		return acceptObject
	}

	// Setup dropzone
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: getAcceptFromString(accept),
		maxSize: parsedMaxSize,
		maxFiles: parsedMaxFiles,
		disabled,
		noClick: files.length >= parsedMaxFiles,
		noKeyboard: files.length >= parsedMaxFiles,
	})

	// Determine if we should show the dropzone
	const showDropzone = parsedMaxFiles > 1 || files.length === 0

	// 是否为头像模式
	const isAvatarMode = variant === "avatar"

	return (
		<div
			className={cn("w-full space-y-2", classNames?.container, className)}
			{...props}
		>
			{/* Dropzone */}
			{showDropzone && (
				<div
					{...getRootProps()}
					className={cn(
						uploaderVariants({ variant, size }),
						isDragActive && "border-primary bg-primary/5",
						disabled && "cursor-not-allowed opacity-60",
						classNames?.dropzone,
					)}
				>
					<input {...getInputProps()} />
					{children ? (
						children
					) : placeholder && files.length === 0 ? (
						placeholder
					) : (
						<div className="flex flex-col items-center justify-center text-center space-y-2">
							<Upload
								className={cn(
									"text-muted-foreground",
									isAvatarMode ? "h-6 w-6" : "h-8 w-8",
								)}
							/>
							<div
								className={cn(
									"font-medium",
									isAvatarMode ? "text-xs" : "text-sm",
								)}
							>
								<span className="text-primary">Click to upload</span>{" "}
								{!isAvatarMode && "or drag and drop"}
							</div>
							{!isAvatarMode && (
								<p className="text-xs text-muted-foreground">
									{accept.replace(/\w+\/\*/g, "images")}
									{parsedMaxFiles > 1 && ` (Max ${parsedMaxFiles} files)`}
									{parsedMaxSize &&
										` (Max ${formatFileSize(parsedMaxSize)} each)`}
								</p>
							)}
						</div>
					)}
				</div>
			)}

			{/* Error message */}
			{error && (
				<div
					className={cn(
						"flex items-center gap-2 text-destructive text-sm",
						classNames?.error,
					)}
				>
					<AlertCircle className="h-4 w-4" />
					<span className="whitespace-pre-line">{error}</span>
				</div>
			)}

			{/* Preview area */}
			{files.length > 0 && (
				<div
					className={cn(
						"grid gap-2",
						isAvatarMode
							? "flex items-start"
							: parsedMaxFiles > 1
								? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
								: "grid-cols-1",
						classNames?.preview,
					)}
				>
					{files.map((file, index) => (
						<UploaderItem
							key={typeof file === "string" ? file : file.id}
							file={file}
							onRemove={() => handleRemove(file)}
							variant={variant}
							size={size}
							className={classNames?.previewItem}
						/>
					))}
				</div>
			)}
		</div>
	)
}

// Props for the uploader item component
interface UploaderItemProps {
	file: FileOrUrl
	onRemove: () => void
	variant?: "default" | "image" | "destructive" | "avatar" | null
	size?: "sm" | "default" | "md" | "lg" | null
	className?: string
}

// Component for displaying individual uploaded files
function UploaderItem({
	file,
	onRemove,
	variant,
	size,
	className,
}: UploaderItemProps) {
	const isUrlString = typeof file === "string"
	const isImage =
		isUrlString || (file as FileWithPreview).type.startsWith("image/")
	const preview = isUrlString ? file : (file as FileWithPreview).preview
	const fileName = isUrlString
		? file.split("/").pop() || "image"
		: (file as FileWithPreview).name
	const fileSize = isUrlString ? null : (file as FileWithPreview).size

	// 是否为头像模式
	const isAvatarMode = variant === "avatar"

	// Avatar variant
	if (isAvatarMode) {
		// 根据尺寸调整大小
		const avatarSizeClasses = {
			sm: "h-16 w-16",
			default: "h-24 w-24",
			md: "h-32 w-32",
			lg: "h-40 w-40",
		}

		const buttonSizeClasses = {
			sm: "h-5 w-5 right-0 top-0",
			default: "h-6 w-6 -right-0 top-0",
			md: "h-7 w-7 right-0 top-0",
			lg: "h-8 w-8 right-0 top-0",
		}

		const iconSizeClasses = {
			sm: "h-2 w-2",
			default: "h-3 w-3",
			md: "h-3.5 w-3.5",
			lg: "h-4 w-4",
		}

		return (
			<div
				className={cn(
					"relative  overflow-hidden p-2",
					size ? avatarSizeClasses[size] : avatarSizeClasses.default,
					className,
				)}
			>
				{isImage ? (
					<img
						src={preview}
						alt={fileName}
						className="h-full w-full object-cover rounded-lg"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<FileText
							className={cn(
								"text-muted-foreground",
								size === "sm"
									? "h-6 w-6"
									: size === "lg"
										? "h-10 w-10"
										: "h-8 w-8",
							)}
						/>
					</div>
				)}
				<Button
					type="button"
					variant="destructive"
					size="icon"
					className={cn(
						"absolute rounded-full opacity-90 hover:opacity-100 shadow-md",
						size ? buttonSizeClasses[size] : buttonSizeClasses.default,
					)}
					onClick={(e) => {
						e.stopPropagation()
						onRemove()
					}}
				>
					<X
						className={cn(
							size ? iconSizeClasses[size] : iconSizeClasses.default,
						)}
					/>
				</Button>
			</div>
		)
	}

	// 图片和默认变体的尺寸
	const isImageVariant = variant === "image"

	// Size classes for preview container
	const sizeClasses = {
		sm: isImageVariant ? "aspect-video max-w-36" : "aspect-square max-w-24",
		default: isImageVariant
			? "aspect-video max-w-48"
			: "aspect-square max-w-32",
		md: isImageVariant ? "aspect-video max-w-64" : "aspect-square max-w-40",
		lg: isImageVariant ? "aspect-video max-w-80" : "aspect-square max-w-48",
	}

	// Default rendering for files and images
	return (
		<div
			className={cn(
				"group relative rounded-md border bg-background overflow-hidden",
				size && sizeClasses[size],
				className,
			)}
		>
			{/* Preview content */}
			<div
				className={cn(
					"relative w-full overflow-hidden",
					isImageVariant ? "aspect-video" : "aspect-square",
				)}
			>
				{isImage ? (
					<img
						src={preview}
						alt={fileName}
						className="h-full w-full object-cover transition-all group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted/20">
						<FileText
							className={cn(
								"text-muted-foreground",
								size === "sm"
									? "h-6 w-6"
									: size === "lg"
										? "h-10 w-10"
										: "h-8 w-8",
							)}
						/>
					</div>
				)}
			</div>

			{/* File info */}
			<div className="p-2">
				<p
					className={cn(
						"font-medium truncate",
						size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs",
					)}
					title={fileName}
				>
					{fileName}
				</p>
				{fileSize && (
					<p className="text-xs text-muted-foreground">
						{(fileSize / 1024).toFixed(1)} KB
					</p>
				)}
			</div>

			{/* Remove button */}
			<Button
				type="button"
				variant="destructive"
				size="icon"
				className={cn(
					"absolute right-1 top-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100 shadow-md z-10",
					size === "sm" ? "h-5 w-5" : size === "lg" ? "h-7 w-7" : "h-6 w-6",
				)}
				onClick={(e) => {
					e.stopPropagation()
					onRemove()
				}}
			>
				<X
					className={cn(
						size === "sm"
							? "h-2.5 w-2.5"
							: size === "lg"
								? "h-3.5 w-3.5"
								: "h-3 w-3",
					)}
				/>
			</Button>
		</div>
	)
}
