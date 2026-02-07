"use client"

import React from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Crop, UploadCloud, X } from "lucide-react"

type ImageUploaderProps = {
  label: string
  value?: string
  context: string
  aspect?: number
  helper?: string
  isUploading?: boolean
  upload: (file: File, context: string) => Promise<string | null>
  onUploaded: (url: string) => void
}

type CropState = {
  x: number
  y: number
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  fileType: string,
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas not supported")
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao cortar a imagem"))
          return
        }
        resolve(blob)
      },
      fileType || "image/jpeg",
      0.92,
    )
  })
}

export function ImageUploader({
  label,
  value,
  context,
  aspect = 1,
  helper,
  isUploading,
  upload,
  onUploaded,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [fileToCrop, setFileToCrop] = React.useState<File | null>(null)
  const [crop, setCrop] = React.useState<CropState>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null)
  const [processing, setProcessing] = React.useState(false)

  React.useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [imageSrc])

  const openFileDialog = () => inputRef.current?.click()

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Selecione uma imagem valida.")
      return
    }
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }
    const url = URL.createObjectURL(file)
    setFileToCrop(file)
    setImageSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file ?? null)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const onCropComplete = React.useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleConfirmCrop = async () => {
    if (!fileToCrop || !imageSrc) return
    setProcessing(true)
    try {
      const croppedBlob = croppedAreaPixels
        ? await getCroppedImage(imageSrc, croppedAreaPixels, fileToCrop.type)
        : fileToCrop

      const file = croppedBlob instanceof Blob
        ? new File([croppedBlob], fileToCrop.name, { type: croppedBlob.type || fileToCrop.type })
        : fileToCrop

      const url = await upload(file, context)
      if (url) {
        onUploaded(url)
      }
      setFileToCrop(null)
      setImageSrc(null)
    } catch (error) {
      console.error(error)
      alert("Nao foi possivel cortar a imagem.")
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelCrop = () => {
    setFileToCrop(null)
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }
    setImageSrc(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div
        className={`rounded-xl border border-dashed px-4 py-4 transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-border bg-card"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/60">
            {value ? (
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Arraste e solte ou clique para selecionar uma imagem.
            </p>
            {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openFileDialog}
                className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Selecionar imagem
              </button>
              {(isUploading || processing) && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Crop className="h-3.5 w-3.5" />
                  Enviando...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        className="hidden"
      />

      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Cortar imagem</h3>
                <p className="text-xs text-muted-foreground">
                  Ajuste o recorte antes de enviar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4 h-72 overflow-hidden rounded-xl border border-border bg-secondary">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={processing}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {processing ? "Enviando..." : "Salvar corte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
