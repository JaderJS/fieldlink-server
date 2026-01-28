import sharp, { Sharp } from "sharp"
import { gps } from "exifr"

type GpsMetadata = {
    latitude: number
    longitude: number
}

export type ImageVariant = {
    key: string
    buffer: Buffer
    width: number
    height: number
    format: "webp"
    sizeKb: string
}

type ProcessedImage = {
    original: ImageVariant
    variants: Record<string, ImageVariant>
}

export abstract class ImageProcess {

    static CONFIG = {
        maxSize: 2000,
        variants: {
            thumb: 300,
            medium: 800,
            large: 1980
        },
        quality: 80
    }


    static async process(buffer: Buffer): Promise<ProcessedImage> {

        const gpsData = await this.extractGps(buffer)
        
        const img = sharp(buffer, { failOn: "error" })

        const metadata = await img.metadata()
        if (!metadata.width || !metadata.height) {
            throw new Error("Invalid image")
        }

        const normImg = img
            .rotate()
            .resize({
                width: this.CONFIG.maxSize,
                height: this.CONFIG.maxSize,
                fit: 'inside',
                withoutEnlargement: true,
            })

        const originalBuffer = await normImg
            .clone()
            .webp({ quality: this.CONFIG.quality })
            .toBuffer({ resolveWithObject: true })

        const original: ImageVariant = {
            key: "original.webp",
            buffer: originalBuffer.data,
            width: originalBuffer.info.width,
            height: originalBuffer.info.height,
            format: "webp",
            sizeKb: String((originalBuffer.data.length / 1024).toFixed(2)) + "KiB",
        }

        const variants: ProcessedImage['variants'] = {}

        for (const [name, size] of Object.entries(this.CONFIG.variants)) {
            let resized = normImg.clone().resize(size)

            if (name === "thumb") {
                resized = await this.removeWithBackground(resized)
            }

            const { data, info } = await resized
                .webp({ quality: name !== "large" ? this.CONFIG.quality : 100 })
                .toBuffer({ resolveWithObject: true })

            variants[name] = {
                key: `${name}.webp`,
                buffer: data,
                width: info.width,
                height: info.height,
                format: 'webp',
                sizeKb: String((data.length / 1024).toFixed(2)) + "KiB"
            }
        }
        return { variants, original }
    }

    static async removeWithBackground(img: Sharp, options: { threshold: number } = { threshold: 240 }) {
        return img
            .clone()
            .ensureAlpha()
            .linear(1, -options.threshold)
            .threshold(options.threshold)
            .negate()
            .toColourspace("b-w")
            .joinChannel(
                await img
                    .clone()
                    .ensureAlpha()
                    .toColourspace("b-w")
                    .threshold(options.threshold)
                    .negate()
                    .toBuffer()
            )
    }

    static async extractGps(buffer: Buffer): Promise<GpsMetadata | undefined> {
        try {
            const { latitude, longitude } = await gps(buffer)
            return { latitude, longitude }
        } catch (error) {
            return
        }
    }

    private static async applyGpsOverlay(img: Sharp, gps: GpsMetadata) {
        const text = `Lat ${gps.latitude.toFixed(6)} | Lng ${gps.longitude.toFixed(6)}`

        const svg = `
      <svg width="800" height="60">
        <style>
          .bg { fill: rgba(0,0,0,.6); }
          .txt {
            fill: white;
            font-size: 28px;
            font-family: Arial, sans-serif;
            font-weight: bold;
          }
        </style>
        <rect x="0" y="0" width="100%" height="100%" class="bg"/>
        <text x="20" y="40" class="txt">${text}</text>
      </svg>
    `

        return img.composite([
            {
                input: Buffer.from(svg),
                gravity: "southwest"
            }
        ])
    }
}