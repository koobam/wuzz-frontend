/** What the server answers once a picture is stored. */
export type UploadedImage = { url: string; key: string; content_type: string; size: number; width: number; height: number };

/** Where a picture belongs, so the storage keeps them apart. */
export type UploadFolder = 'outlets' | 'banners' | 'vouchers';
