/** What the server answers once a picture is stored. */
export type UploadedImage = { url: string; key: string; content_type: string; size: number; width: number; height: number; /** The media id: what a service's icon_media_id stores. */ id: string; folder: UploadFolder };

/** Where a picture belongs, so the storage keeps them apart. */
export type UploadFolder = 'outlets' | 'banners' | 'vouchers' | 'services';
