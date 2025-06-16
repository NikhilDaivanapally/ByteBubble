// utils/safeDiscriminator.ts
import mongoose, { Schema, Model, Document } from "mongoose";

export const safeDiscriminator = <
  T extends Document,
  U extends Document = T
>(
  baseModel: Model<T>,
  discriminatorModelName: string,     // Unique model name like "DirectSystem"
  schema: Schema,
  discriminatorValue?: string         // Optional discriminator value like "system"
): Model<U> => {
  // Use a unique model name for discriminator registration
  if (!baseModel.discriminators?.[discriminatorModelName]) {
    // Pass discriminatorValue if provided
    return baseModel.discriminator<U>(
      discriminatorModelName,
      schema,
      discriminatorValue
    );
  }
  return baseModel.discriminators[discriminatorModelName] as Model<U>;
};
