import { model, Schema } from 'mongoose';
import { EContentType, EPermissionType, EValuesTypes, IRule, RuleModel } from './rule.interface';

const ruleSchema = new Schema<IRule, RuleModel>({
     content: {
          type: Schema.Types.Mixed,
          required: function (this: IRule) {
               return Object.values(EContentType).includes(this.type);
          },
     },

     type: {
          type: String,
          enum: [...Object.values(EContentType)],
          select: 0,
     },
     permission: {
          type: Boolean,
          select: 0,
     },
     permissionType: {
          type: String,
          enum: [...Object.values(EPermissionType)],
          select: 0,
     },
     value: {
          type: Number,
          required: function (this: IRule) {
               return [...Object.values(EValuesTypes)].includes(this.valuesTypes);
          },
     },
     valuesTypes: {
          type: String,
          enum: [...Object.values(EValuesTypes)],
          select: 0,
     },
});

export const Rule = model<IRule, RuleModel>('Rule', ruleSchema);
