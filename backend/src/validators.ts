import { z } from 'zod';

export const GeoPointSchema = z.object({
  lat: z.number().refine((v) => Math.abs(v) <= 90, 'lat invalid'),
  lng: z.number().refine((v) => Math.abs(v) <= 180, 'lng invalid'),
});

export const StringLocationSchema = z
  .string()
  .regex(/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/, 'location must be "lat,lng"');

export const FlexibleLocationSchema = z.union([GeoPointSchema, StringLocationSchema]);

export const FarmerMetadataSchema = z.object({
  name: z.string().min(1),
  produce: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().nonnegative(),
  location: FlexibleLocationSchema,
  harvestDate: z.string().default(() => new Date().toISOString()),
  role: z.literal('farmer'),
});

export const CreateBatchSchema = z.object({
  batchId: z.string().min(1),
  metadata: FarmerMetadataSchema,
  identity: z.string().optional(),
});

export const DistributorUpdateSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nonnegative(),
  marginPrice: z.number().nonnegative(),
  location: FlexibleLocationSchema,
  transportMode: z.string().min(1),
  expectedDelivery: z.string().min(1),
  status: z.literal('IN_TRANSIT'),
  role: z.literal('distributor'),
  note: z.string().optional().default(''),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export const RetailerUpdateSchema = z.object({
  retailerName: z.string().min(1),
  storeName: z.string().min(1),
  sellingPrice: z.number().nonnegative(),
  location: FlexibleLocationSchema,
  shelfLife: z.string().min(1),
  storageConditions: z.string().min(1),
  status: z.literal('AVAILABLE_FOR_SALE'),
  role: z.literal('retailer'),
  note: z.string().optional().default(''),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export const StatusUpdateSchema = z.union([DistributorUpdateSchema, RetailerUpdateSchema]);

export const UpdateBatchSchema = z.object({
  statusUpdate: StatusUpdateSchema,
  identity: z.string().optional(),
});

export type CreateBatchInput = z.infer<typeof CreateBatchSchema>;
export type UpdateBatchInput = z.infer<typeof UpdateBatchSchema>; 