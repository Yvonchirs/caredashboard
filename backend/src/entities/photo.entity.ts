import { defineEntity, p } from '@mikro-orm/core';
import { Activity } from './activity.entity.js';

export const PhotoSchema = defineEntity({
  name: 'Photo',
  properties: {
    id: p.integer().primary(),
    filename: p.string(),
    activity: () => p.manyToOne(Activity).deleteRule('cascade'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Photo extends PhotoSchema.class {}
PhotoSchema.setClass(Photo);
